import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

const hasGetUserMedia = !!(getUserMediaPonyfill())

// Adapted from https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// Use a pony fill to avoid editing global objects
function getUserMediaPonyfill() {
  const mediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  if (mediaDevices) {
    return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
  }
  /*
  Ignoring the old api, due to inconsistent behaviours
  */
  else {
    return null
  }
}

export default class Webcam extends Component {
  static defaultProps = {
    audio: true,
    height: 480,
    width: 640,
    screenshotFormat: 'image/webp',
    onUserMedia: () => {},
    onFailure: (error) => {}
  };

  static propTypes = {
    audio: PropTypes.bool,
    muted: PropTypes.bool,
    onUserMedia: PropTypes.func,
    height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    screenshotFormat: PropTypes.oneOf([
      'image/webp',
      'image/png',
      'image/jpeg'
    ]),
    className: PropTypes.string
  };

  static mountedInstances = [];

  static userMediaRequested = false;

  constructor(props) {
    super(props);
    this.state = {
      hasUserMedia: false
    };

    if (!hasGetUserMedia) {
      const error = new Error('getUserMedia is not supported by this browser')
      this.props.onFailure(error)
    }
  }

  componentDidMount() {
    Webcam.mountedInstances.push(this);

    if (!Webcam.userMediaRequested) {
      this.requestUserMedia();
    }
  }

  requestUserMedia() {
    let sourceSelected = (audioSource, videoSource) => {
      const {width, height} = this.props;

      let constraints = {
        video: {
          sourceId: videoSource,
          width: { exact: width },
          height: { exact: height }
        }
      };

      if (this.props.audio) {
        constraints.audio = {
          sourceId: audioSource
        };
      }

      const logError = e => console.log("error", e, typeof e)

      const onSuccess = stream => {
        this.handleUserMedia(stream);
      }

      const onError = e => {
        logError(e)
        this.handleError(e);
      }

      const getUserMedia = getUserMediaPonyfill()
      getUserMedia(constraints).then(onSuccess).catch((e) => {
        if (e.name.toLowerCase().includes("constrain") ){
          /* This is a fallback for Firefox due to an inconsistency with Chrome
          If the requested exact resolution is higher than the supported webcam resolution
          Chrome will upscale, however Firefox will trigger an OverConstraintError.

          In case a non exact resolution is requested, Firefox will handle all cases gracefully
          and prepare a resolution which is as close as possible to the requested one.
          If the supported webcam resolution is higher than the requested one, then it downscales;
          if it's lower, then it gives the highest available.

          However, if no exact resolution is set, then Chrome will give the lowest resolution
          of the webcam, this seems like a bug.

          Therefore, the exact constrainst works best on Chrome and the ideal one best on Firefox.

          ref: https://webrtchacks.com/getusermedia-resolutions-3/
          ref: https://w3c.github.io/mediacapture-main/getusermedia.html#constrainable-interface
          ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
           */
          constraints.video = {
            sourceId: videoSource,
            width, height//this is the same as using ìdeal
          }
          getUserMedia(constraints).then(onSuccess).catch(onError)
        }
        else{
          onError(e)
        }
      });
    };

    if (this.props.audioSource && this.props.videoSource) {
      sourceSelected(this.props.audioSource, this.props.videoSource);
    } else {
      if ('mediaDevices' in navigator) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          let audioSource = null;
          let videoSource = null;

          devices.forEach((device) => {
            if (device.kind === 'audio') {
              audioSource = device.id;
            } else if (device.kind === 'video') {
              videoSource = device.id;
            }
          });

          sourceSelected(audioSource, videoSource);
        })
        .catch((error) => {
          console.log(`${error.name}: ${error.message}`); // eslint-disable-line no-console
        });
      } else {
        MediaStreamTrack.getSources((sources) => {
          let audioSource = null;
          let videoSource = null;

          sources.forEach((source) => {
            if (source.kind === 'audio') {
              audioSource = source.id;
            } else if (source.kind === 'video') {
              videoSource = source.id;
            }
          });

          sourceSelected(audioSource, videoSource);
        });
      }
    }

    Webcam.userMediaRequested = true;
  }

  handleError (error) {
    this.setState({
      hasUserMedia: false
    });
    this.props.onFailure(error)
  }

  handleUserMedia(stream) {
    let src = window.URL.createObjectURL(stream);
    if (this.state.src) window.URL.revokeObjectURL(src);

    this.stream = stream;
    this.setState({
      hasUserMedia: true,
      src
    });

    this.props.onUserMedia();
  }

  componentWillUnmount() {
    let index = Webcam.mountedInstances.indexOf(this);
    Webcam.mountedInstances.splice(index, 1);

    if (Webcam.mountedInstances.length === 0 && this.state.hasUserMedia) {
      if (this.stream.stop) {
        this.stream.stop();
      } else {
        if (this.stream.getVideoTracks) {
          for (let track of this.stream.getVideoTracks()) {
            track.stop();
          }
        }
        if (this.stream.getAudioTracks) {
          for (let track of this.stream.getAudioTracks()) {
            track.stop();
          }
        }
      }
      Webcam.userMediaRequested = false;
      window.URL.revokeObjectURL(this.state.src);
    }
  }

  getScreenshot() {
    if (!this.state.hasUserMedia) return null;

    let canvas = this.getCanvas();
    return canvas.toDataURL(this.props.screenshotFormat);
  }

  getCanvas() {
    if (!this.state.hasUserMedia) return null;

    const video = findDOMNode(this);

    if (!this.canvas) this.canvas = document.createElement('canvas');
    const {canvas} = this;

    if (!this.ctx) this.ctx = canvas.getContext('2d');
    const {ctx} = this;

    //This is set every time incase the video element has resized
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  render() {
    return (
      <video
        autoPlay
        width={this.props.width}
        height={this.props.height}
        src={this.state.src}
        muted={this.props.muted}
        className={this.props.className}
      />
    );
  }
}
