'use strict'

module.exports = function(RED) {

  //fastNlMeansDenoisingColored
  function FastNlMeansDenoising(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "fastNlMeansDenoising",
        params: {
          img: msg.payload,
          h: parseFloat(config.hh),
          hColor: parseFloat(config.hColor),
          templateWindowSize: parseInt(config.templateWindowSize),
          searchWindowSize: parseInt(config.searchWindowSize)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img,
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("fast Nlmeans denoising", FastNlMeansDenoising);

  //inpaint
  function Inpainting(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "inpaint",
        params: {
          img_src: msg.payload.img,
          img_inpaintMask: msg.payload.img_mask,
          inpaintRadius: parseFloat(config.inpaintRadius),
          flags: parseInt(config.flags)
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
  RED.nodes.registerType("inpainting", Inpainting);
}
