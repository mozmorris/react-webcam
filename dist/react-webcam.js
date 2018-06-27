(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("prop-types"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["prop-types", "react"], factory);
	else if(typeof exports === 'object')
		exports["Webcam"] = factory(require("prop-types"), require("react"));
	else
		root["Webcam"] = factory(root["PropTypes"], root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(0);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function hasGetUserMedia() {
  return !!(navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var constrainStringType = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.shape({
  exact: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)])
}), _propTypes2.default.shape({
  ideal: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)])
})]);

var constrainBooleanType = _propTypes2.default.oneOfType([_propTypes2.default.shape({
  exact: _propTypes2.default.bool
}), _propTypes2.default.shape({
  ideal: _propTypes2.default.bool
})]);

var constrainLongType = _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.shape({
  exact: _propTypes2.default.number,
  ideal: _propTypes2.default.number,
  min: _propTypes2.default.number,
  max: _propTypes2.default.number
})]);

var constrainDoubleType = constrainLongType;

var audioConstraintType = _propTypes2.default.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  autoGainControl: constrainBooleanType,
  channelCount: constrainLongType,
  latency: constrainDoubleType,
  noiseSuppression: constrainBooleanType,
  sampleRate: constrainLongType,
  sampleSize: constrainLongType,
  volume: constrainDoubleType
});

var videoConstraintType = _propTypes2.default.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  aspectRatio: constrainDoubleType,
  facingMode: constrainStringType,
  frameRate: constrainDoubleType,
  height: constrainLongType,
  width: constrainLongType
});

var Webcam = function (_Component) {
  _inherits(Webcam, _Component);

  function Webcam() {
    _classCallCheck(this, Webcam);

    var _this = _possibleConstructorReturn(this, (Webcam.__proto__ || Object.getPrototypeOf(Webcam)).call(this));

    _this.state = {
      hasUserMedia: false
    };
    return _this;
  }

  _createClass(Webcam, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!hasGetUserMedia()) return;

      Webcam.mountedInstances.push(this);

      if (!this.state.hasUserMedia && !Webcam.userMediaRequested) {
        this.requestUserMedia();
      }
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      if (JSON.stringify(nextProps.audioConstraints) !== JSON.stringify(this.props.audioConstraints) || JSON.stringify(nextProps.videoConstraints) !== JSON.stringify(this.props.videoConstraints)) {
        this.requestUserMedia();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var index = Webcam.mountedInstances.indexOf(this);
      Webcam.mountedInstances.splice(index, 1);

      if (Webcam.mountedInstances.length === 0 && this.state.hasUserMedia) {
        if (this.stream.stop) {
          this.stream.stop();
        } else {
          if (this.stream.getVideoTracks) {
            this.stream.getVideoTracks().map(function (track) {
              return track.stop();
            });
          }
          if (this.stream.getAudioTracks) {
            this.stream.getAudioTracks().map(function (track) {
              return track.stop();
            });
          }
        }
        Webcam.userMediaRequested = false;
        window.URL.revokeObjectURL(this.state.src);
      }
    }
  }, {
    key: 'getScreenshot',
    value: function getScreenshot() {
      if (!this.state.hasUserMedia) return null;

      var canvas = this.getCanvas();
      return canvas && canvas.toDataURL(this.props.screenshotFormat, this.props.screenshotQuality);
    }
  }, {
    key: 'getCanvas',
    value: function getCanvas() {
      if (!this.state.hasUserMedia || !this.video.videoHeight) return null;

      if (!this.ctx) {
        var _canvas = document.createElement('canvas');
        var aspectRatio = this.video.videoWidth / this.video.videoHeight;

        var canvasWidth = this.props.screenshotWidth || this.video.clientWidth;

        _canvas.width = canvasWidth;
        _canvas.height = canvasWidth / aspectRatio;

        this.canvas = _canvas;
        this.ctx = _canvas.getContext('2d');
      }

      var ctx = this.ctx,
          canvas = this.canvas;

      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

      return canvas;
    }
  }, {
    key: 'requestUserMedia',
    value: function requestUserMedia() {
      var _this2 = this;

      navigator.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      var sourceSelected = function sourceSelected(audioConstraints, videoConstraints) {
        var constraints = {
          video: videoConstraints || true
        };

        if (_this2.props.audio) {
          constraints.audio = audioConstraints || true;
        }

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
          Webcam.mountedInstances.forEach(function (instance) {
            return instance.handleUserMedia(null, stream);
          });
        }).catch(function (e) {
          Webcam.mountedInstances.forEach(function (instance) {
            return instance.handleUserMedia(e);
          });
        });
      };

      if ('mediaDevices' in navigator) {
        sourceSelected(this.props.audioConstraints, this.props.videoConstraints);
      } else {
        var optionalSource = function optionalSource(id) {
          return { optional: [{ sourceId: id }] };
        };

        var constraintToSourceId = function constraintToSourceId(constraint) {
          var deviceId = (constraint || {}).deviceId;

          if (typeof deviceId === 'string') {
            return deviceId;
          } else if (Array.isArray(deviceId) && deviceId.length > 0) {
            return deviceId[0];
          } else if ((typeof deviceId === 'undefined' ? 'undefined' : _typeof(deviceId)) === 'object' && deviceId.ideal) {
            return deviceId.ideal;
          }

          return null;
        };

        MediaStreamTrack.getSources(function (sources) {
          var audioSource = null;
          var videoSource = null;

          sources.forEach(function (source) {
            if (source.kind === 'audio') {
              audioSource = source.id;
            } else if (source.kind === 'video') {
              videoSource = source.id;
            }
          });

          var audioSourceId = constraintToSourceId(_this2.props.audioConstraints);
          if (audioSourceId) {
            audioSource = audioSourceId;
          }

          var videoSourceId = constraintToSourceId(_this2.props.videoConstraints);
          if (videoSourceId) {
            videoSource = videoSourceId;
          }

          sourceSelected(optionalSource(audioSource), optionalSource(videoSource));
        });
      }

      Webcam.userMediaRequested = true;
    }
  }, {
    key: 'handleUserMedia',
    value: function handleUserMedia(error, stream) {
      if (error) {
        this.setState({
          hasUserMedia: false
        });
        this.props.onUserMediaError(error);

        return;
      }
      try {
        var src = window.URL.createObjectURL(stream);

        this.stream = stream;
        this.setState({
          hasUserMedia: true,
          src: src
        });
      } catch (err) {
        this.stream = stream;
        this.video.srcObject = stream;
        this.setState({
          hasUserMedia: true
        });
      }

      this.props.onUserMedia();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement('video', {
        autoPlay: true,
        width: this.props.width,
        height: this.props.height,
        src: this.state.src,
        muted: this.props.audio,
        className: this.props.className,
        playsInline: true,
        style: this.props.style,
        ref: function ref(_ref) {
          _this3.video = _ref;
        }
      });
    }
  }]);

  return Webcam;
}(_react.Component);

Webcam.defaultProps = {
  audio: true,
  className: '',
  height: 480,
  onUserMedia: function onUserMedia() {},
  onUserMediaError: function onUserMediaError() {},
  screenshotFormat: 'image/webp',
  width: 640,
  screenshotQuality: 0.92
};
Webcam.propTypes = {
  audio: _propTypes2.default.bool,
  onUserMedia: _propTypes2.default.func,
  onUserMediaError: _propTypes2.default.func,
  height: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  width: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  screenshotFormat: _propTypes2.default.oneOf(['image/webp', 'image/png', 'image/jpeg']),
  style: _propTypes2.default.object,
  className: _propTypes2.default.string,
  screenshotQuality: _propTypes2.default.number,
  screenshotWidth: _propTypes2.default.number,
  audioConstraints: audioConstraintType,
  videoConstraints: videoConstraintType
};
Webcam.mountedInstances = [];
Webcam.userMediaRequested = false;
exports.default = Webcam;
module.exports = exports['default'];

/***/ })
/******/ ]);
});