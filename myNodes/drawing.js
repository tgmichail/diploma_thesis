'use strict'

module.exports = function(RED) {
  //drawBBsFromPoints
  function DrawBBsFromPoints(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "drawBBsFromPoints",
        params: {
          img: msg.payload
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results;
        msg.key = '?todo';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("draw bbs from points", DrawBBsFromPoints);
}
