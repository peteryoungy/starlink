import React, {Component} from 'react';
import { feature } from 'topojson-client';
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import {Spin} from "antd";

import { WORLD_MAP_URL, SATELLITE_POSITION_URL} from "../constants";

import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";


// note: DidMount get map data
const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor(){
        super();
        this.state = {
            isLoading: false,
            isDrawing: false
        }
        // ref method, React createRef
        this.map = null
        this.refMap = React.createRef(); // note: ref定义
        this.refTrack = React.createRef();

        // d3 color
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                if(res.status === 200){

                    // console.log(res.data)
                    const { data } = res;
                    const land = feature(data, data.objects.countries).features;
                    // console.log(feature(data, data.objects.countries))
                    this.generateMap(land);
                }

            })
            .catch(e => console.log('err in fetch world map data ', e))
    }

    generateMap(land){
        console.log('Generate Map.')

        //
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        const graticule = geoGraticule();

        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        // note: content about the canvas
        const context = canvas.node().getContext("2d");
        const context2 = canvas2.node().getContext("2d");

        //
        let path = geoPath()
            .projection(projection)
            .context(context);

        land.forEach(ele => {
            // land and country
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            // 经纬线
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            // 边界线
            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })

        this.map = {
            projection: projection,
            graticule: graticule,
            context: context,
            context2: context2
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        console.log('preProps ->', prevProps )
        console.log('preState ->', prevState )

        // note: compare reference?
        if(prevProps.satData !== this.props.satData) {
            // step1: get all parameters for the url
            // step2: config
            // step3: send request to the server
            // step4: track or prompt an error
            const {
                latitude,
                longitude,
                elevation,
                altitude,
                duration
            } = this.props.observerData;

            const endTime = duration * 60;

            // note: array => array
            const urls = this.props.satData.map(sat => {
                const {satid} = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${process.env["REACT_APP_API_KEY"]}`;
                return axios.get(url)
            })

            this.setState({
                isLoading: true
            })

            Promise.all(urls)
                .then(results => {
                    console.log(results)
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    })

                    // tracking
                    const arr = results.map(sat => {
                        if(sat.status === 200){
                            return sat.data;
                        }
                    })

                    // case1: isDrawing true -> cannot track
                    // case2: isDrawing false -> can track
                    if(!prevState.isDrawing) {
                        // tracking
                        this.track(arr);
                    } else {
                        const ohint = document.getElementsByClassName("hint")[0];
                        ohint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch( err => {

                    console.log("err in fetch satellite position -> ", err.message);
                    this.setState({
                        isLoading: false
                    })
                })
        }
    }

    track = data => {
        if(!data[0].hasOwnProperty("positions")) {
            throw new Error("No sat position!")
            return;
        }

        const len = data[0].positions.length;
        const {duration } = this.props.observerData;
        const { context2 } = this.map

        let now = new Date();
        let i = 0;

        let timer = setInterval( ()=> {
            let ct = new Date();

            let timePassed = i === 0? 0: ct - now;
            let time = new Date(now.getTime() + 60 * timePassed);

            // clear
            context2.clearRect(0, 0, width, height);

            // note: display time
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            // finished tracking
            if( i>= len){
                clearInterval(timer);
                this.setState({
                    isDrawing: false
                })
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            // drawing each position
            data.forEach( sat => {
                const { info, positions} = sat;
                this.drawSet(info, positions[i])
            })
            i += 60;
        }, 1000)
    }

    drawSet = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join(""); // att: regular expression

        const {projection, context2} = this.map;
        const xy = projection([satlongitude, satlatitude])

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);

    }

    render() {

        const {isLoading} = this.state;

        return (
            <div className="map-box">
                {/*
                // note: ref: get area
                // note: ref赋值
                */}
                {
                    isLoading
                        ?
                    <div className="spinner">
                        <Spin tip="Loading..." size="large"/>
                    </div>
                    :
                    null
                }
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack}/>

                <div className="hint"/>
            </div>
        );
    }
}

export default WorldMap;
