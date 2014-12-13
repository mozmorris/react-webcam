(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);
	else if(typeof exports === 'object')
		exports["Webcam"] = factory(require("React"));
	else
		root["Webcam"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	
	function hasGetUserMedia() {
	  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	            navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}
	
	module.exports = React.createClass({
	  displayName: 'Webcam',
	
	  getInitialState: function() {
	    return {
	      on: false
	    };
	  },
	
	  render: function () {
	    return (
	      React.createElement("video", {autoPlay: true, ref: "video"})
	    );
	  },
	
	  componentDidMount: function() {
	    self = this;
	    var video = this.refs.video.getDOMNode();
	
	    if (!hasGetUserMedia()) return;
	
	    navigator.getUserMedia = navigator.getUserMedia ||
	                          navigator.webkitGetUserMedia ||
	                          navigator.mozGetUserMedia ||
	                          navigator.msGetUserMedia;
	
	    if (this.props.audioSource && this.props.videoSource) {
	      sourceSelected(this.props.audioSource, this.props.videoSource);
	    } else {
	      MediaStreamTrack.getSources(function(sourceInfos) {
	        var audioSource = null;
	        var videoSource = null;
	
	        sourceInfos.forEach(function(sourceInfo) {
	          if (sourceInfo.kind === 'audio') {
	            console.log(sourceInfo.id, sourceInfo.label || 'microphone');
	
	            audioSource = sourceInfo.id;
	          } else if (sourceInfo.kind === 'video') {
	            console.log(sourceInfo.id, sourceInfo.label || 'camera');
	
	            videoSource = sourceInfo.id;
	          } else {
	            console.log('Some other kind of source: ', sourceInfo);
	          }
	        });
	
	        sourceSelected(audioSource, videoSource);
	      });
	    }
	
	    function sourceSelected(audioSource, videoSource) {
	      var constraints = {
	        audio: {
	          optional: [{sourceId: audioSource}]
	        },
	        video: {
	          optional: [{sourceId: videoSource}]
	        }
	      };
	
	      navigator.getUserMedia(constraints, successCallback, errorCallback);
	    }
	
	    function successCallback(stream) {
	      self.setState({on:true});
	      video.src = window.URL.createObjectURL(stream);
	    };
	
	    function errorCallback(e) {
	      video.src = self.props.fallbackURL;
	    };
	  },
	
	  getScreenshot: function() {
	    if (!this.state.on) return;
	
	    var video = this.refs.video.getDOMNode();
	
	    var canvas = document.createElement('canvas');
	    canvas.height = video.clientHeight;
	    canvas.width = video.clientWidth;
	
	    var ctx = canvas.getContext('2d');
	    ctx.drawImage(video, 0, 0);
	
	    return canvas.toDataURL('image/webp');
	  }
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});

//# sourceMappingURL=react-webcam.map