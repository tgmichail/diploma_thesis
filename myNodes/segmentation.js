//color quantisation using k kmeans

'use strict'

module.exports = function(RED) {
  function ColorQuantization(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "colorQuant",
        params: {
          img: msg.payload,
          k: parseInt(config.kappa),
          eps: parseFloat(config.eps),
          maxIter: parseInt(config.maxIter),
          attempts: parseInt(config.attempts),
          initCentersFlag: parseInt(config.initCenters)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        let msg1 = {payload: response.data.results.img, key: 'img', times: msg.times};
        let msg2 = {payload: response.data.results.img_labels, key: 'img', times: msg.times};
        let msg3 = {payload: response.data.results.colors, times: msg.times}; //TODO what key to put here?
        nodeSend([msg1, msg2, msg3]);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("color quantization", ColorQuantization);


  function ActiveContourSegmentation(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "activeContourSegmentation",
        params: {
          img: "",
          corners: "",
          alpha: parseFloat(config.alpha),
          beta: parseFloat(config.beta),
          gamma: parseFloat(config.gamma),
          gausSigma: parseFloat(config.gausSigma),
          linePointsStep: parseInt(config.linePointsStep)
        }
      }

      // option to give the contour from the previous node
      if ( msg.payload.hasOwnProperty("contour") ){
        request.params.img = msg.payload.img;
        request.params.corners = msg.payload.contour;
      } else {
        request.params.img = msg.payload;
        request.params.corners = JSON.parse(config.corners);
      }

      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.contour;
        msg.key = 'contour';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("active contour segmentation", ActiveContourSegmentation);


  function ChanVeseSegmentation(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "chanVeseSegmentation",
        params: {
          img: msg.payload,
          initLevelSetType: config.initLevelSetType,
          numIterations: parseInt(config.numIterations),
          smoothing: parseInt(config.smoothing),
          l1: parseFloat(config.l1),
          l2: parseFloat(config.l2)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img_mask;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("morphological chan vese segmentation", ChanVeseSegmentation);
}
