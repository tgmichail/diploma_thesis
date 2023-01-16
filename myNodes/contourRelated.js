'use strict'

module.exports = function(RED) {

  //findContours
  function FindContours(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "findContours",
        params: {
          img: msg.payload,
          method: parseInt(config.method),
          mode: parseInt(config.mode)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.contourList;
        msg.key = 'contourList';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("find contours", FindContours);


  //contourProperties
  function ContourProperties(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      // payload is like dict. We do it this way, because arrays are also considered objects
      const payloadIsObj = msg.payload.hasOwnProperty("contour");

      let request = {
        funcName: "contourProperties",
        params: {
          contour: (payloadIsObj ? msg.payload.contour : msg.payload),
          prop: config.prop,
          img_ref: (payloadIsObj ? msg.payload.img : null)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){
        if (config.prop == 'all') {
          msg.payload = response.data.results;
          msg.key = 'numbers'
        } else {
          msg.payload = response.data.results[config.prop];
          msg.key = 'number'
        }
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("contour properties", ContourProperties);

  //contourFilter
  function ContourFilter(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      // formulate criteria
      let criteria = [];

      for (var i = 1; i <= 4; i++) {
        // user didn't give criterion i
        if (config["attr-"+i] == "-")
          continue;

        let compare;
        if (config["is-"+i] == "gteq")
          compare = ">=";
        else if (config["is-"+i] == "lteq")
          compare = "<=";

        criteria.push({'attr': config["attr-"+i], 'type': config["unit-"+i],
          'thresh': parseFloat(config["val-"+i]), 'compare': compare});
      }

      let request = {
        funcName: "contourFilter",
        params: {
          contourList: msg.payload,
          criteria: criteria
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.contourList;
        msg.key = 'contourList';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("contour filter", ContourFilter);


  //approxPolyDP
  function ApproxPolyDP(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "approxPolyDP",
        params: {
          contour_curve: msg.payload,
          epsilon: parseFloat(config.epsilon),
          closed: config.closed
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.contour;
        msg.key = 'contour';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("contour approximate", ApproxPolyDP);

  //matchShapes
  function MatchShapes(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "matchShapes",
        params: {
          contour_contour1: msg.payload.contour_1,
          contour_contour2: msg.payload.contour_2,
          method: parseInt(config.method),
          parameter: 0
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.number; //TODO new type?
        msg.key = 'number'
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("match shapes", MatchShapes);

  //boundingShape
  function BoundingShape(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "boundingShape",
        params: {
          contour: msg.payload,    //points? isws TODO fix, paei mazi me to python arxeio
          shape: config.shape
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        if (config.shape == "Circle") {
          msg.payload = response.data.results.circle;
          msg.key = 'circle';
        } else if (config.shape == "Rectangle") {
          msg.payload = response.data.results.boundingbox;
          msg.key = 'boundingbox';
        } else {  // rotated rectangle or triangle
          msg.payload = response.data.results.contour;
          msg.key = 'contour';
        }
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("bounding shape", BoundingShape);
}
