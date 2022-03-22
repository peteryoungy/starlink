1. layout

​                     App

header      main        Footer

​		setting     list         map

2. data communication

在哪几个components之间通信

setting: lat,long, ele, att, time

list:  lat, long

map: position: lat, long, time

他们是sibling关系

谁给后端发送请求？main

setting向main发送数据，main向后端发送请求，把数据传给list和map





父相子绝



高阶函数 Higher Ordered Function

How to use function

1. passing a function as parameter: cb

2. return a function

高阶函数：是一个函数；参数是一个函数或者返回一个函数。好处：更灵活，易于拓展，更动态。

定时器，foreach, promise



高阶组件：Higher Ordered Component（HOC）

React的设计思想。

1. 本质是一个函数。

2. 函数接收一个组件，返回一个新组件。

```js
const SatSetting = Form.create({name: 'satellite-setting'})(SatSettingForm)
```

Form.create({name: 'satellite-setting'})是一个高阶组件。





text/babel

HOC

组件有太多duplicate代码。



d3

原生JS

react simple maps





怎么画一个map

1. map data: topjson- client 地图数据的处理

2. real map -> page map projection: d3

d3-geo 

d3-projection

d3-selection 选择地图
