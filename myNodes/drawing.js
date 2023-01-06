'use strict'

module.exports = function(RED) {
  //drawContours
  function DrawContours(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawContours",
        params: {
          img: msg.payload.img,
          index : -1,
          contourList: msg.payload.contourList,
          randColors: config.randColors,
          color: hexToRGB(config.colorVal),
          thickness: parseInt(config.thickness),
          lineType: parseInt(config.lineType)
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
  RED.nodes.registerType("draw contours", DrawContours);

  //drawLines
  function DrawLines(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawLines",
        params: {
          img: msg.payload.img,
          lineList: msg.payload.lineList,
          randColors: config.randColors,
          color: hexToRGB(config.colorVal),
          thickness: parseInt(config.thickness),
          lineType: parseInt(config.lineType)
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
  RED.nodes.registerType("draw lines", DrawLines);

  //drawCircles
  function DrawCircles(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawCircles",
        params: {
          img: msg.payload.img,
          circleList: msg.payload.circleList,
          randColors: config.randColors,
          color: hexToRGB(config.colorVal),
          thickness: parseInt(config.thickness),
          lineType: parseInt(config.lineType)
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
  RED.nodes.registerType("draw circles", DrawCircles);

  //drawBBs
  function DrawBBs(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawBBs",
        params: {
          img: msg.payload.img,
          bbList: msg.payload.bbList,
          randColors: config.randColors,
          color: hexToRGB(config.colorVal),
          thickness: parseInt(config.thickness),
          lineType: parseInt(config.lineType)
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
  RED.nodes.registerType("draw bbs", DrawBBs);

  //drawBBsFromPoints
  function DrawBBsFromPoints(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawBBsFromPoints",
        params: {
          img: msg.payload.img,
          points: msg.payload.points,
          bbDims: msg.payload.bbDims || [parseInt(config.ww), parseInt(config.hh)],
          color: hexToRGB(config.colorVal),
          thickness: parseInt(config.thickness),
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
  RED.nodes.registerType("draw bbs from points", DrawBBsFromPoints);
}


function hexToRGB(hex){

  hex = hex.substring(1,7).match(/.{2}/g);
  let rgb = [
    parseInt(hex[0], 16),
    parseInt(hex[1], 16),
    parseInt(hex[2], 16)
  ];
  return rgb;
 }
