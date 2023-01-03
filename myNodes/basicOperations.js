//changing colorspaces
//tuneHSV
//morphTransform
//Image thresholding
//TODO
//#Image Adding and Blending - OpenCV ready
//addOffsetOrCrop
//
//combineImages

'use strict'

module.exports = function(RED) {
  //getImageDims
  function GetImageDims(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "getImageDims",
        params: {
          img: msg.payload
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results; //TODO does this need a msg.key? Maybe not
        msg.key = "numbers"
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("get image dims", GetImageDims);

  //cvtColor
  function ChangeColorSpace(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "cvtColor",
        params: {
          img_src: msg.payload,
          code: parseInt(config.colCode)
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
  RED.nodes.registerType("change color space", ChangeColorSpace);


  //minMaxPoints
  function MinMaxLoc(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "minMaxPoints",
        params: {
          probMatr: msg.payload,
          getMin: config.getMin,
          multiPoints: config.multiPoints,
          threshold: parseFloat(config.threshold)
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.points;
        msg.key = 'points'
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("get min max location", MinMaxLoc);


  //tuneHSV
  function TuneHSV(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "tuneHSV",
        params: {
          img: msg.payload,
          ch: config.ch,
          multiply: parseFloat(config.multiply),
          add: parseInt(config.addi),
          modulo: config.modulo
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
  RED.nodes.registerType("tune hsv", TuneHSV);

  //morphTransform
  function MorphTransform(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "morphTransform",
        params: {
          img: msg.payload,
          kernelSize: parseInt(config.kernelSize),
          kernelShape: parseInt(config.kernelShape),
          transform: parseInt(config.which),
          iterationNum: parseInt(config.iterationNum)
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
  RED.nodes.registerType("morphological transform", MorphTransform);


  //thresholding(img, threshType: int, threshSubtype: int = 0, adaptiveMethod: int = 0,
  //thresh: = 127 , maxVal: int = 255, blockSize = 11, C = 0):
  function Thresholding(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "thresholding",
        params: {
          threshType: parseInt(config.threshType),
          threshSubtype: parseInt(config.threshSubtype),
          adaptiveMethod: parseInt(config.adaptiveMethod),
          thresh: parseFloat(config.thresh),
          maxVal: parseInt(config.maxVal),
          blockSize: parseInt(config.blockSize),
          C: parseInt(config.const)
        }
      }

      if (msg.key == "img") {
        request.params.img = msg.payload;
      } else if (msg.key == "probMatr") {
        request.params.probMatr = msg.payload;
      } //else {
        //todo throw some error? also add on other stuff maybe?
      //}

      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("thresholding", Thresholding);

  //split
  function SplitImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "split",
        params: {
          img_m: msg.payload
        }
      }

      broker.sendMsg(request, node, msg.times, function callback(response){
        let msg1 = {payload: response.data.results.img_0, key: 'img', times: msg.times};
        let msg2 = {payload: response.data.results.img_1, key: 'img', times: msg.times};
        let msg3 = {payload: response.data.results.img_2, key: 'img', times: msg.times}; //TODO what key to put here?

        nodeSend([msg1, msg2, msg3]);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("split image", SplitImg);

  //merge
  function MergeImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "merge",
        params: {
          img_0: msg.payload.ch_0,
          img_1: msg.payload.ch_1,
          img_2: msg.payload.ch_2,
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
  RED.nodes.registerType("merge image", MergeImg);

  //add
  function AddImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "add",
        params: {
          img_src1: msg.payload.img_1,
          img_src2: msg.payload.img_2
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
  RED.nodes.registerType("add image", AddImg);

  //addWeighted
  function AddWeightedImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "addWeighted",
        params: {
          img_src1: msg.payload.img_1,
          img_src2: msg.payload.img_2,
          alpha: parseFloat(config.alpha),
          beta: parseFloat(config.beta),
          gamma: parseFloat(config.gamma)
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
  RED.nodes.registerType("add weighted image", AddWeightedImg);

  //subtract
  function SubtractImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "subtract",
        params: {
          img_src1: msg.payload.img_1,
          img_src2: msg.payload.img_2
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
  RED.nodes.registerType("subtract image", SubtractImg);

  //compare
  function CompareImgs(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

    let request = {
        funcName: "compare",
        params: {
          img_1: msg.payload.img_1,
          img_2: msg.payload.img_2,
          method: config.method,
          tileSize: [parseInt(config.tileSizeX), parseInt(config.tileSizeY)]
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
  RED.nodes.registerType("compare image", CompareImgs);

  //multiply
  function MultImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "multiply",
        params: {
          scale: parseFloat(config.scale)
        }
      }

      if (typeof msg.payload == "string") { //just one image
        request.params.img_1 = msg.payload
      } else if (msg.payload.hasOwnProperty("probMatr")) {  //image x probMatr
        request.params.img_1 = msg.payload.img
        request.params.probMatr = msg.payload.probMatr
      } else {  //image x image (or image x scalar if img_2 is undefined)
        request.params.img_1 = msg.payload.img_1
        request.params.img_2 = msg.payload.img_2
      }

      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("multiply image", MultImg);

  //resize
  function ResizeImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "resize",
        params: {
          img_src: msg.payload,
          dsize: [parseInt(config.dsize_cols), parseInt(config.dsize_rows)],
          fx: parseFloat(config.fx),
          fy: parseFloat(config.fy),
          interpolation: parseInt(config.interpolationMode)
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
  RED.nodes.registerType("resize image", ResizeImg);

  //affineTransform
  function AffineTransform(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "affineTransform",
        params: {
          img: msg.payload,
          translationPercentX: parseFloat(config.translationPercentX),
          translationPercentY: parseFloat(config.translationPercentY),
          rotCenterPercentX: parseFloat(config.rotCenterPercentX),
          rotCenterPercentY: parseFloat(config.rotCenterPercentY),
          rotAngle: parseFloat(config.rotAngle),
          scale:  parseFloat(config.scale)
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
  RED.nodes.registerType("affine transform", AffineTransform);


  //combineImages
  function CombineImg(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "combineImages",
        params: {
          img_0: msg.payload.img_1,
          img_1: msg.payload.img_2,
          img_mask:  msg.payload.img_mask
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
  RED.nodes.registerType("combine images", CombineImg);

  //prepareImgForOverlay
  function PrepareImgForOverlay(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "prepareImgForOverlay",
        params: {
          img: msg.payload,
          dest_shape: [parseInt(config.dest_shape_w), parseInt(config.dest_shape_h)],
          left: parseFloat(config.left),
          top: parseFloat(config.top),
          offsetsPercent: config.offsetsPercent
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
  RED.nodes.registerType("prepare img for overlay", PrepareImgForOverlay);

  // AddOffsetOrCrop
  function AddOffsetOrCrop(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let color
      if (config.isGrayscale){
        color = parseInt(config.grayscaleVal)
      } else {
        // colorVal is in #FFFFFF format
        color = hexToRGB(config.colorVal)
      }
      let request = {
        funcName: "addOffsetOrCrop",
        params: {
          img: msg.payload,
          left: parseInt(config.left),
          right: parseInt(config.right),
          top: parseInt(config.top),
          bot: parseInt(config.bot),
          bgColor: color
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
  RED.nodes.registerType("add offset or crop", AddOffsetOrCrop);
}

function hexToRGB(hex){

  hex = hex.substring(1,7).match(/.{2}/g);
  let rgb = [
    parseInt(hex[0], 16),
    parseInt(hex[1], 16),
    parseInt(hex[2], 16)
  ];
  return rgb;
 }
