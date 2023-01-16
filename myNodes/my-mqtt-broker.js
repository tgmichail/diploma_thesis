'use strict'

const mqtt = require('mqtt')

module.exports = function(RED) {
  function MyMQTTBrokerNode(config) {

    const client = mqtt.connect({ port: parseInt(config.port), host: config.host,
      username: config.username, password: config.password})
    this.client = client;
    this.isConnected = false;

    let node = this;
    let instances = {}

    client.on('message', function(topic, message) {

      console.log('got message at topic '+topic);
      client.unsubscribe(topic)

      if (! (topic in instances) || !instances[topic]){
        // This could happen, if 2 servers are on the same broker.
        console.error('got unexpected message at topic '+topic)
        return
      }

      const node2= instances[topic].node,
        callback = instances[topic].cb,
        sentTime = instances[topic].tSend;

      try {
        const netTime = (Date.now() - sentTime) / 1000; // in seconds

        let response = JSON.parse(message);
        if (response.data.statusMsg != 'Success'){
          node2.error(response.data.statusMsg);
          delete instances[topic]
          return
        }

        // update the dict in the node, with call-by-reference
        instances[topic].times[node2.id] = {netTime: netTime, pyTime: response.data.pyTime,
            funcTime: response.data.funcTime, type: node2.type};
        delete instances[topic]

        callback(response)

      } catch (e) {
        node2.error('Exception in node-red js: ' + e)
      }
    });

    client.on('connect', function(){
      node.isConnected = true;
      node.status({fill:"green",shape:"dot",text:"connected"});
    });

    client.on('close', function(){
      node.isConnected = false;
      node.status({fill:"red",shape:"ring",text:"disconnected"});
    });


    this.sendMsg = function(request, funcNode, timeStats, callback){

      if (! node.isConnected){
        funcNode.error('The MQTT broker '+ config.lname +' is not connected!');
        return;
      }

      let tmpTopicName = "rpc_" + getRndInteger(0, 1000000000);
      client.subscribe(tmpTopicName)

      const sendTime = Date.now(); //ms since epoch
      instances[tmpTopicName] = {node: funcNode, tSend: sendTime, cb: callback, times: timeStats};

      let payload = {
        header: {
          timestamp: sendTime,
          reply_to: tmpTopicName
        },
        data: request
      }

      let payloadEnc = JSON.stringify(payload);

      client.publish('image_requests', payloadEnc);
    }

    RED.nodes.createNode(this, config);
  }
  RED.nodes.registerType("my-mqtt-broker", MyMQTTBrokerNode);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
