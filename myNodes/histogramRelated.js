'use strict'

module.exports = function(RED) {

  //calcHist
  function CalcHist(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      const payloadIsObj = msg.payload.hasOwnProperty("img");

      let request = {
        funcName: "calcHist",
        params: {
          img: (payloadIsObj ? msg.payload.img : msg.payload),
          numBins: parseInt(config.numBins),
          img_mask: (payloadIsObj ? msg.payload.img_mask : null),
          channel: parseInt(config.channel),
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.hist;
        msg.key = 'hist';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("calculate histogram", CalcHist);


  //plotHist
  function PlotHist(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "plotHist",
        params: {
          img: msg.payload,
          perChannel: config.perChannel,
          logy: config.logy
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
  RED.nodes.registerType("plot histogram", PlotHist);

  //histEqualization
  function HistEqualization(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "histEqualization",
        params: {
          img: msg.payload,
          equalType: parseInt(config.equalType),
          clipLimit: parseFloat(config.clipLimit),
          tileGridSizeY: parseInt(config.tileGridSizeY),
          tileGridSizeX: parseInt(config.tileGridSizeX)
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
  RED.nodes.registerType("histogram equalization", HistEqualization);


  //matchHist
  function MatchHist(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      if (!('img_ref' in msg.payload)){
        node.error('Give an img_ref in the input message');
        return;
      }

      let request = {
        funcName: "matchHist",
        params: {
          img: msg.payload.img,
          img_ref: msg.payload.img_ref
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
  RED.nodes.registerType("match histogram", MatchHist);

  //calc2DHist
  function Calc2DHist(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "calc2DHist",
        params: {
          img: msg.payload,
          colSpaceType: config.colSpaceType,
          ch1: parseInt(config.ch1),
          ch2: parseInt(config.ch2)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.floatMatr_hist;
        msg.key = 'floatMatr';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("calculate 2d histogram", Calc2DHist);
}
