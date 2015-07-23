import React, { Component } from 'react';

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

class Webcam extends Component {
  displayName: 'Webcam'

  constructor() {
    super();
    this.state = {
      on: false
    };
  }

  componentWillMount() {
    Webcam.mountedInstances.push(this);
  }

  componentDidMount() {
    self = this;

    if (!hasGetUserMedia()) return;
    if (Webcam.userMediaRequested) return;

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
          optional: [{sourceId: videoSource}]
        }
      };

      if (self.props.audio)
        constraints.audio = {
          optional: [{sourceId: audioSource}]
        }

      navigator.getUserMedia(constraints, function(stream) {
        Webcam.mountedInstances.forEach(function(instance) {
          instance._successCallback(stream);
        });
      }, function(e) {
        Webcam.mountedInstances.forEach(function(instance) {
          instance._errorCallback(e);
        });
      });
    }

    Webcam.userMediaRequested = true;
  }

  _successCallback(stream) {
    let src = window.URL.createObjectURL(stream);

    this.setState({
      hasUserMedia: true,
      src
    });
  }

  _errorCallback(e) {
    this.setState({
      src: this.state.src
    });
  }

  componentWillUnmount() {
    if (this.state.hasUserMedia) {
      window.URL.revokeObjectURL(this.state.src);
    }
  }

  getScreenshot() {
    if (!this.state.hasUserMedia) return;

    var canvas = document.createElement('canvas');
    canvas.height = video.clientHeight;
    canvas.width = video.clientWidth;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/webp');
  }

  render() {
    return (
      <video
        autoPlay
        width={this.props.width}
        height={this.props.height}
        src={this.state.src}
      ></video>
    );
  }
}
Webcam.defaultProps = {
  audio: true,
  height: 480,
  width: 640
};
Webcam.mountedInstances = [];
Webcam.userMediaRequested = false;


export default Webcam;
