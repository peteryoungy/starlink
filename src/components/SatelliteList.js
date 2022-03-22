import React, {Component} from 'react';
import { List, Avatar, Button, Checkbox, Spin } from 'antd';
import satellite from "../assets/images/satellite.svg";

class SatelliteList extends Component {

    // state = {
    //     selected: []
    // };

    constructor(){
        super();
        this.state = {
            selected: []
        };
    }

    // note:
    onChange = e => {
        console.log(e.target)

        // add or remove selected set to/from selected array

        const { dataInfo, checked } = e.target;
        const { selected } = this.state; // att: get state?
        const list = this.addOrRemove(dataInfo, checked, selected);
        this.setState({ selected: list })
    }

    // note: item, selected or not, list
    //  return a new list
    addOrRemove = (item, status, list) => {
        // note: whether the item is in the list
        const found = list.some( entry => entry.satid === item.satid);

        // note:
        //  case1: check is true, selected
        if(status && !found){
            list=[...list, item]
            // list = list.push(item)
        }

        // note:
        //  case2: check is false, unselected,
        if(!status && found){
            list = list.filter( entry => {
                return entry.satid !== item.satid;
            });
        }
        return list;
    }

    onShowSatMap = () =>{
        this.props.onShowMap(this.state.selected);
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoad } = this.props;

        const { selected } = this.state;

        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn"
                        size="large"
                        disabled={ selected.length === 0}
                        onClick={this.onShowSatMap}
                >Track on the map</Button>
                <hr/>

                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={satellite} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />

                                </List.Item>
                            )}
                        />
                }
            </div>
        );
    }
}

export default SatelliteList;
