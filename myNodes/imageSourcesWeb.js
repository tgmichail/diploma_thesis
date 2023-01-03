'use strict'

//const http = require('http');
const fs = require("fs");
const path = require("path");

module.exports = function(RED) {
  // Load Image from Web. Is a saved subflow. See https://nodered.org/docs/creating-nodes/subflow-modules
  const subflowContents = fs.readFileSync(path.join(__dirname,"loadImgFromWeb.json"));
  RED.nodes.registerSubflow(JSON.parse(subflowContents));
}
