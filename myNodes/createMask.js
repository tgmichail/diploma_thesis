
'use strict'

module.exports = function(RED) {
  function CreateWindow(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {
      const parametricWindowTypes = ["kaiser", "gaussian", "slepian", "dpss", "chebwin", "exponential", "tukey"];

      let windowType = config.windowType;
      if (parametricWindowTypes.includes(windowType))
        windowType = [windowType, parseFloat(config.param)];

      let request = {
        funcName: "createWindow",
        params: {
          windowType: windowType,
          w: parseInt(config.ww),
          h: parseInt(config.hh)
        }
      }
      if (msg.payload.dimensions){
        request.params.w = msg.payload.dimensions[0]; // TODO verify that w,h is the right order
        request.params.h = msg.payload.dimensions[1];
      } else if (msg.key == 'dimensions') {
        request.params.w = msg.payload[0];
        request.params.h = msg.payload[1];
      }
      
      let timeStats = msg.times || {};

      broker.sendMsg(request, node, timeStats, function callback(response){

        let msg = {payload: response.data.results.probMatr, key: 'probMatr',
          times: timeStats};
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("create window", CreateWindow);

  function CreateΜaskFromContour(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "createMaskFromContour",
        params: {
          dimensions : msg.payload.dimensions || [config.ww, config.hh], // TODO verify that w,h is the right order
          contour: msg.payload.contour || msg.payload
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
  RED.nodes.registerType("create mask from contour", CreateΜaskFromContour);
}
