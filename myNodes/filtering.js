'use strict'

module.exports = function(RED) {

  //blur
  function Blur(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "blur",
        params: {
          img_src: msg.payload,
          ksize: [parseInt(config.ksizex), parseInt(config.ksizey)]
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
  RED.nodes.registerType("blur", Blur);


  //GaussianBlur
  function GaussianBlur(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "GaussianBlur",
        params: {
          img_src: msg.payload,
          ksize: [parseInt(config.ksizex), parseInt(config.ksizey)],
          sigmaX: 0
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
  RED.nodes.registerType("gaussian blur", GaussianBlur);

  //medianBlur
  function MedianBlur(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "medianBlur",
        params: {
          img_src: msg.payload,
          ksize: parseInt(config.ksize)
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
  RED.nodes.registerType("median blur", MedianBlur);

  //bilateralFilter
  function BilateralFilter(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "bilateralFilter",
        params: {
          img_src: msg.payload,
          d: parseInt(config.dd),
          sigmaColor: parseInt(config.sigmaColor),
          sigmaSpace: parseInt(config.sigmaSpace)
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
  RED.nodes.registerType("bilateral filter", BilateralFilter);

  //filter2D
  //exclude it for now, because we dont have the previous node that creates the 2d filter
  /*function GeneralFilter(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "filter2D",
        params: {
          img_src: msg.payload.img,//TODO chec etsi legetai?
          ddepth: -1,
          kernel: msg.payload.kernel//TODO ayto thelei ftiaksimo to prin tou
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
  RED.nodes.registerType("general filter", GeneralFilter);*/

  //gradient
  function Gradient(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let dx = 0, dy = 0;
      if (config.filterType == "Scharr") {
        dx = parseInt(config.scharrDerivative);
        dy = 1 - dx;
      } else {
        dx = parseInt(config.dx);
        dy = parseInt(config.dy);
      }

      let request = {
        funcName: "gradient",
        params: {
          img: msg.payload,
          filterType: config.filterType,
          dx: dx,
          dy: dy,
          ksize: parseInt(config.ksize)
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
  RED.nodes.registerType("gradient", Gradient);

  //unsharpMask
  function UnsharpMasking(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "unsharpMask",
        params: {
          img: msg.payload,
          radius: parseFloat(config.radius),
          amount: parseFloat(config.amount)
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
  RED.nodes.registerType("unsharp masking", UnsharpMasking);


  //Canny
  function CannyED(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "Canny",
        params: {
          img_image: msg.payload,
          threshold1: parseInt(config.threshold1),
          threshold2: parseInt(config.threshold2),
          apertureSize: parseInt(config.apertureSize),
          L2gradient: config.L2gradient
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
  RED.nodes.registerType("canny edge detection", CannyED);
}
