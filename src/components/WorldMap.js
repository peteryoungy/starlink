import React, {Component} from 'react';
import { feature } from 'topojson-client';
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';

import { WORLD_MAP_URL } from "../constants";

// note: DidMount get map data
const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor(){
        super();
        this.state = {
            map: null
        }
        // ref method, React createRef
        this.refMap = React.createRef(); // note: ref定义
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

        // note: 内容
        let context = canvas.node().getContext("2d");

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

    }

    render() {
        return (
            <div className="map-box">
                {/*
                // note: ref: get area
                // note: ref赋值
                */}
                <canvas className="map" ref={this.refMap} />
            </div>
        );
    }
}

export default WorldMap;
