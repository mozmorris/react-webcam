var React = require('react');

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

module.exports = React.createClass({
  displayName: 'Webcam',

  render: function () {
    return (
      <video autoPlay ref='video'></video>
    );
  },

  componentDidMount: function() {
    var self = this;
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
      video.src = window.URL.createObjectURL(stream);
    };

    function errorCallback(e) {
      video.src = self.props.fallbackURL;
    };
  }
});
