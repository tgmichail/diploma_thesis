//backprojection
//templMatching
//Hough line detection

'use strict'

module.exports = function(RED) {

  function HistBackprojection(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "backprojection",
        params: {
          img_target: msg.payload.img,
          img_roi: msg.payload.img_roi,
          convElemSize: parseInt(config.convElemSize)
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
  RED.nodes.registerType("histogram backprojection", HistBackprojection);


  function TemplMatching(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "templMatching",
        params: {
          img: msg.payload.img,
          img_template: msg.payload.img_template,
          method: parseInt(config.method),
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        if (config.method % 2 == 1) { //SQDIFF_NORMED = 1, CCORR_NORMED = 3, CCOEFF_NORMED = 5
          msg.payload = response.data.results.probMatr;
          msg.key = 'probMatr';
        } else { //SQDIFF = 0, CCORR = 2, CCOEFF = 4
          msg.payload = response.data.results.floatMatr;
          msg.key = 'floatMatr';
        }
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("template matching", TemplMatching);


  function HoughLineDetection(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "HoughLines",
        params: {
          img: msg.payload,
          threshold: parseInt(config.threshold),
          rho: parseFloat(config.rho),
          theta: parseFloat(config.theta),
          probabilistic: config.multiPoints,
          minLineLength: parseFloat(config.minLineLength),
          maxLineGap: parseFloat(config.maxLineGap)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.lineList;
        msg.key = 'lineList';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("hough line detection", HoughLineDetection);


  function HoughCircleDetection(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "HoughCircles",
        params: {
          img: msg.payload,
          method: parseInt(config.method),
          dp: parseFloat(config.dp),
          minDist: parseFloat(config.minDist),
          param1: parseInt(config.param1),
          param2: parseFloat(config.param2),
          minRadius: parseInt(config.minRadius),
          maxRadius: parseInt(config.maxRadius)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.circleList;
        msg.key = 'circleList';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("hough circle detection", HoughCircleDetection);
}
