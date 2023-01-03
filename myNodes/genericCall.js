
'use strict'

module.exports = function(RED) {
  function GenericCall(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);
    let config_params = JSON.parse(config.params);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let msgObj = {};
      if (msg.key) // it has a single input. Not many connected to a join node
        msgObj[msg.key] = msg.payload;
      else
        msgObj = msg.payload;


      let request = {
        funcName: config.funcName,
        params: { ...config_params, ...msgObj }
      }

      if (config.outputLabel){
        request.returnLabel = config.outputLabel.split(',');

        if (config.outputs != request.returnLabel.length){
          node.error("Outputs number and Custom output types given are not equal.")
          return
        }

        if (request.returnLabel.length == 1) // just one label given
          request.returnLabel = request.returnLabel[0]
      }

      broker.sendMsg(request, node, msg.times, function callback(response){

        // If successful (if we are here), add the params to the global context imgNodesSavedConfigs
        // The last argumnet is the context store name. We put it so that some context is stored
        //    in a file, and some on memory 
        let imgNodesSavedConfigs = node.context().global.get('imgNodesSavedConfigs', "file")
        if (! imgNodesSavedConfigs)
          imgNodesSavedConfigs = {}

        imgNodesSavedConfigs[config.funcName] = {
          params: Object.keys(config_params), // array of just the keys
          outputs: config.outputs,
          outputLabel: config.outputLabel
        }
        node.context().global.set('imgNodesSavedConfigs', imgNodesSavedConfigs, "file")

        // Parse the results
        const resultKeys = Object.keys(response.data.results);
        const resultValues = Object.values(response.data.results);

        // Format the output messages, based on the number of outputs given by the user
        // the may be more ore less than the actual number of results
        // If outputs > results, fills the rest with "undefined", which in JSON will be null???
        // If outputs < results, the rest results are lost
        let messages = new Array(config.outputs);
        for (let i = 0; i < config.outputs; i++) {
          messages[i] = {key: resultKeys[i], payload: resultValues[i], times: msg.times};
        }

        nodeSend(messages);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("generic call", GenericCall);
}
