'use strict'

/* This file contains code from https://github.com/rikukissa/node-red-contrib-image-output
by Riku Rouvila licensed under the MIT license */

module.exports = function(RED) {

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
