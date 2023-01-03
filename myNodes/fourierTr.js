// nodes for fourierTr

'use strict'

module.exports = function(RED) {
  // fourierTransform
  function FourierTransform(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "fourierTransform",
        params: {
          img: msg.payload
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        let msg1 = {payload: response.data.results.floatMatr_magnitude, key: 'floatMatr', times: msg.times};
        let msg2 = {payload: response.data.results.probMatr_phase, key: 'probMatr', times: msg.times};
        nodeSend([msg1, msg2]);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("fourier transform", FourierTransform);


  // invFourierTransform
  function InvFourierTransform(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "invFourierTransform",
        params: {
          floatMatr_magnitudeSpectrum: msg.payload.magnitude,
          probMatr_phaseSpectrum: msg.payload.phase
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  };
  RED.nodes.registerType("inverse fourier transform", InvFourierTransform);
}
