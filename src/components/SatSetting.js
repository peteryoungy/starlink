import React, {Component} from 'react';
import {Form, InputNumber, Button} from 'antd';


class SatSettingForm extends Component {




    render() {

        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };

        return (
            <Form {...formItemLayout} className="sat-setting" onSubmit={this.showSatellite}>
                <Form.Item label="Longitude(degrees)">
                    {
                        getFieldDecorator("longitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Longitude",
                                }
                            ],
                        })(<InputNumber min={-180} max={180}
                                        style={{width: "100%"}}
                                        placeholder="Please input Longitude"
                        />)
                    }
                </Form.Item>
            </Form>
        );
    }
}
// note: 包裹一层才能拿到props.form对象
const SatSetting = Form.create({name: 'satellite-setting'})(SatSettingForm)
export default SatSetting;