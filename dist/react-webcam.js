'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var Webcam = (function (_Component) {
  function Webcam() {
    _classCallCheck(this, Webcam);

    _get(Object.getPrototypeOf(Webcam.prototype), 'constructor', this).call(this);
    this.state = {
      on: false
    };
  }

  _inherits(Webcam, _Component);

  _createClass(Webcam, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      Webcam.mountedInstances.push(this);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      self = this;

      if (!hasGetUserMedia()) return;
      if (Webcam.userMediaRequested) return;

      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (this.props.audioSource && this.props.videoSource) {
        sourceSelected(this.props.audioSource, this.props.videoSource);
      } else {
        MediaStreamTrack.getSources(function (sourceInfos) {
          var audioSource = null;
          var videoSource = null;

          sourceInfos.forEach(function (sourceInfo) {
            if (sourceInfo.kind === 'audio') {
              audioSource = sourceInfo.id;
            } else if (sourceInfo.kind === 'video') {
              videoSource = sourceInfo.id;
            }
          });

          sourceSelected(audioSource, videoSource);
        });
      }

      function sourceSelected(audioSource, videoSource) {
        var constraints = {
          video: {
            optional: [{ sourceId: videoSource }]
          }
        };

        if (self.props.audio) constraints.audio = {
          optional: [{ sourceId: audioSource }]
        };

        navigator.getUserMedia(constraints, function (stream) {
          Webcam.mountedInstances.forEach(function (instance) {
            instance._successCallback(stream);
          });
        }, function (e) {
          Webcam.mountedInstances.forEach(function (instance) {
            instance._errorCallback(e);
          });
        });
      }

      Webcam.userMediaRequested = true;
    }
  }, {
    key: '_successCallback',
    value: function _successCallback(stream) {
      var src = window.URL.createObjectURL(stream);

      this.setState({
        hasUserMedia: true,
        src: src
      });
    }
  }, {
    key: '_errorCallback',
    value: function _errorCallback(e) {
      this.setState({
        src: this.state.src
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.state.hasUserMedia) {
        window.URL.revokeObjectUrl(this.state.src);
      }
    }
  }, {
    key: 'getScreenshot',
    value: function getScreenshot() {
      if (!this.state.hasUserMedia) return;

      var canvas = document.createElement('canvas');
      canvas.height = video.clientHeight;
      canvas.width = video.clientWidth;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL('image/webp');
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('video', {
        autoPlay: true,
        width: this.props.width,
        height: this.props.height,
        src: this.state.src
      });
    }
  }]);

  return Webcam;
})(_react.Component);

Webcam.defaultProps = {
  audio: true,
  height: 480,
  width: 640
};
Webcam.mountedInstances = [];
Webcam.userMediaRequested = false;

exports['default'] = Webcam;
module.exports = exports['default'];