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

  //changeColorDepth
  function ChangeColorDepth(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {

      let request = {
        funcName: "changeColorDepth",
        params: {
          img: msg.payload
        }
      }
      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = "img"
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("change color depth", ChangeColorDepth);

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
          img_src: msg.payload.img || msg.payload,
          // dsize: set later
          fx: parseFloat(config.fx) || 0,
          fy: parseFloat(config.fy) || 0,
          interpolation: parseInt(config.interpolationMode)
        }
      }

      if (msg.payload.dimensions)
        request.params.dsize = msg.payload.dimensions;
      else
        request.params.dsize = [parseInt(config.dsize_cols) || 0, parseInt(config.dsize_rows) || 0];

      if (request.params.dsize[0] == 0 || request.params.dsize[1] == 0)
        request.params.dsize = null; // so that the size is calculated by fx and fy


      broker.sendMsg(request, node, msg.times, function callback(response){

        msg.payload = response.data.results.img;
        msg.key = 'img';
        nodeSend(msg);
        nodeDone();
      });
    });
  }
  RED.nodes.registerType("resize image", ResizeImg);

  //rotation
  function Rotation(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    let broker = RED.nodes.getNode(config.broker);

    node.on('input', function(msg, nodeSend, nodeDone) {
      let destDims = msg.payload.destDims ||
        [parseInt(config.destDimsX), parseInt(config.destDimsY)];

      let request = {
        funcName: "rotation",
        params: {
          img: msg.payload.img || msg.payload,
          rotCenterX: parseFloat(config.rotCenterX),
          rotCenterY: parseFloat(config.rotCenterY),
          rotAngle: parseInt(config.rotAngle),
          dimsPercent: config.dimsPercent,
          destDims: config.destDimsSame ? null : destDims
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
  RED.nodes.registerType("rotation", Rotation);


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
        color = hexToBGR(config.colorVal)
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

function hexToBGR(hex){ // create solid color takes bgr input

  hex = hex.substring(1,7).match(/.{2}/g);
  return [
    parseInt(hex[2], 16),
    parseInt(hex[1], 16),
    parseInt(hex[0], 16)
  ];
}
