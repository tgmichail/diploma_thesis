'use strict'

/* This file contains code from https://github.com/rikukissa/node-red-contrib-image-output
by Riku Rouvila licensed under the MIT license */

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
          msg.payload = response.data.results.bbpoints;
          msg.key = 'bbpoints';
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

  // Create contour
  function CreateContour(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    this.imageWidth = parseInt(config.width || 160);
    this.imgField   = config.imgField;

    function sendImageToClient(image) {
      let d = { id:node.id }
      if (image !== null) {
        if (Buffer.isBuffer(image)) {
          image = image.toString("base64");
        }
        d.data = image;
      }
      try {
        RED.comms.publish("create_contour", d);
      } catch(e) {
        node.error("Error sending image to browser", e);
      }
    }

    node.on("input", function(msg) {
      let image;

      // Get the image from the location specified in the typedinput field
      RED.util.evaluateNodeProperty(node.imgField, 'msg', node, msg, (err, value) => {
        if (err) {
          node.error(err, "Invalid source of image");
          return;
        } else {
          image = value;
        }
      });

      // Reset the image in case an empty payload arrives
      if (!image || image == "") {
        sendImageToClient(null, msg);
        return;
      }

      if (!Buffer.isBuffer(image) && (typeof image !== 'string') && !(image instanceof String)) {
        node.error("Input should be a buffer or a base64 string",msg);
        return;
      }

      sendImageToClient(image, msg);
    });
    /*node.on("close", function() {
      RED.comms.publish("image", { id:this.id });
      node.status({});
    });*/
  }
  RED.nodes.registerType("create contour", CreateContour);

  // Via the button on the node (in the FLOW EDITOR), the contour is created and
  // sent here. We pass it to the next node
  RED.httpAdmin.post("/created_contour/:id", RED.auth.needsPermission("create contour.write"), function(req,res) {
    let node = RED.nodes.getNode(req.params.id);

    if (node === null || typeof node === "undefined") {
      res.sendStatus(404);
      return;
    }

    node.warn(req);

    try {
      const contour = JSON.parse(req.body.contour);
      const msg = {key: 'contour', payload: contour};
      node.send(msg);

    } catch (e){
      node.error('Create contour could not parse JSON of contour points. ' + req.body);
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  });
}
