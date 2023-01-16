
'use strict'

module.exports = function(RED) {
  function GenericCall(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);
    let config_params = JSON.parse(config.params);

    node.on('input', function(msg, nodeSend, nodeDone) {
      /* How to check if we have just one message, or many after a join node:
         * NOT by checking typeof msg.payload == 'object'. Even if it is a b64 string, it will consider it object.
         * NOT by checking if(msg.key) (exists). Even after a join node, msg.key will be kept from one of the msgs.
         * Maybe by checking if msg.key exists as a key in the msg.payload object. Then it would be the result of join
         * Maybe if we check if it is a js object with another way. Eg. let keys=0;for(x of msg.payload)keys++; and check if keys>0 (?)
             And maybe make sure that the object is not a floatMatr with scale and matr.
      */
      let msgObj = {};
      if (!msg.key || msg.payload.hasOwnProperty(msg.key)) // if msg is the output of a join node. (many inputs)
        msgObj = msg.payload;
      else // just one input
        msgObj[msg.key] = msg.payload;


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
