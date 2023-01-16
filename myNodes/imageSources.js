// nodes for imageSources
//missing:  createRandom maybe

'use strict'

//const http = require('http');

module.exports = function(RED) {
  // createSolidColor
  function CreateSolidColor(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let color
      if (config.isGrayscale){
        color = parseInt(config.grayscaleVal)
      } else {
        // colorVal is in #FFFFFF format
        color = hexToBGR(config.colorVal)
      }

      let request = {
        funcName: "createSolidColor",
        params: {
          x: parseInt(config.chi),  //config.chi is string
          y: parseInt(config.psi),
          color: color
        }
      }
      let timeStats = {};

      broker.sendMsg(request, node, timeStats, function callback(response){

        let msg = {payload: response.data.results.img, key: 'img', times: timeStats};
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("create solid image", CreateSolidColor);


  // getImageFromExamples
  function GetExampleImage(config){
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg){
      let request = {
        funcName: "getImageFromExamples",
        params: {
          name: config.imgName
        }
      }
      let timeStats = {};
      
      broker.sendMsg(request, node, timeStats, function callback(response){

        let msg = {payload: response.data.results.img, key: 'img', times: timeStats};
        node.send(msg);
      });
    });
  }
  RED.nodes.registerType("get example image", GetExampleImage);


  //addNoise
  function AddNoise(config){
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone){
      let request = {
        funcName: "addNoise",
        params: {
          img: msg.payload,
          gen: config.noiseType,
          mean: parseFloat(config.mean),
          scale: parseFloat(config.scale)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("add noise", AddNoise);

  //use external image
/*  function UseExternalImage(config){
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', function(msg, nodeSend, nodeDone){
      // here we don't need to talk to mqtt server

      let req = http.request(config.url, {}, function (response){
        if (response.statusCode != 200)
          node.warn("HTTP server of external image returned " + response.statusCode);

        res.on('data', function (chunk){
          node.warn(`BODY: ${chunk}`);

          msg.payload = btoa(chunk);
          nodeSend(msg);
          nodeDone();
        });
      });
      req.end();
    });
  }
  RED.nodes.registerType("use external image", UseExternalImage);*/
}

function hexToBGR(hex){ // create solid color takes bgr input

  hex = hex.substring(1,7).match(/.{2}/g);
  return [
    parseInt(hex[2], 16),
    parseInt(hex[1], 16),
    parseInt(hex[0], 16)
  ];
}
