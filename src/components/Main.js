import React, {Component} from 'react';
import { Row, Col } from 'antd';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import {NEARBY_SATELLITE, STARLINK_CATEGORY, SAT_API_KEY} from "../constants";
import axios from "axios";
import WorldMap from "./WorldMap";

class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            satList: null,
            isLoadingList: false,
            setting: null
        };
    }


    showNearbySatellite = (setting) => {
        // console.log(setting);
        this.setState({
            isLoadingList: true,
            setting: setting
        });

        // fetch sat list from the server
        this.fetchSatellite(setting);
    }

    fetchSatellite = setting => {

        // api config
        const {latitude, longitude, elevation, altitude} = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        
        // const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        this.setState({
            isLoadingList: true
        });



        axios.get(url)
            .then(response => {
                console.log(response)
                console.log(response.data)
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
            })

    }

    // todo: showMap Logic
    showMap = (selected) => {
        console.log('show on the map');

        // note: generate a new array, not the reference
        this.setState({
            satList: [...selected]
        })
    }


    render() {

        const { satInfo, isLoadingList, satList, setting } = this.state;
        return (
            <Row>
                <Col span={8} className="left-side">
                    <SatSetting
                        onShow={this.showNearbySatellite}/>
                    <SatelliteList
                        satInfo={satInfo}
                        isLoad={isLoadingList}
                        onShowMap={this.showMap}
                    />
                </Col>
                <Col span={16} className="right-side">
                    <WorldMap satData={satList} observerData={setting} />
                </Col>
            </Row>
        );
    }
}

export default Main;