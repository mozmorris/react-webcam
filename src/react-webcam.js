import React, { Component } from "react";
import PropTypes from "prop-types";

const getUserMedia =
  navigator.mediaDevices &&
  navigator.mediaDevices.getUserMedia &&
  navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

export const SupportsWebcam = !!getUserMedia;

export default class Webcam extends Component {
  static defaultProps = {
    audio: true,
    width: 640,
    height: 480,
    muted: false,
    screenshotFormat: "image/webp",
    onUserMedia: () => {},
    onFailure: () => {},
    className: "",
    facingMode: "user",
  };

  static propTypes = {
    audio: PropTypes.bool,
    muted: PropTypes.bool,
    onUserMedia: PropTypes.func,
    onFailure: PropTypes.func,
    // Safari iOS and some Android Chrome seem to ignore width and height
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    screenshotFormat: PropTypes.oneOf(["image/webp", "image/png", "image/jpeg"]),
    facingMode: PropTypes.oneOf(["user", "environment", "left", "right"]),
    style: PropTypes.object,
    className: PropTypes.string,
    audioSource: PropTypes.string,
    videoSource: PropTypes.string,
  };

  static mountedInstances = [];

  static userMediaRequested = false;

  constructor(props) {
    super(props);
    if (!SupportsWebcam) {
      const error = new Error("getUserMedia is not supported by this browser");
      this.props.onFailure(error);
    }
  }

  state = {
    hasUserMedia: false,
  };

  componentDidMount() {
    Webcam.mountedInstances.push(this);

    if (!this.state.hasUserMedia && !Webcam.userMediaRequested) {
      this.requestUserMedia();
    }
  }

  componentWillUnmount() {
    const index = Webcam.mountedInstances.indexOf(this);
    Webcam.mountedInstances.splice(index, 1);

    if (Webcam.mountedInstances.length === 0 && this.state.hasUserMedia) {
      if (this.stream.stop) {
        this.stream.stop();
      } else {
        if (this.stream.getVideoTracks) {
          this.stream.getVideoTracks().map(track => track.stop());
        }
        if (this.stream.getAudioTracks) {
          this.stream.getAudioTracks().map(track => track.stop());
        }
      }
      Webcam.userMediaRequested = false;
      this.videoElement.srcObject = null;
    }
  }

  requestUserMedia() {
    const sourceSelected = (audioSource, videoSource) => {
      const { width, height, facingMode } = this.props;
      const constraints = {
        video: {
          sourceId: videoSource,
          facingMode,
          width,
          height,
        },
      };

      if (this.props.audio) {
        constraints.audio = {
          sourceId: audioSource,
        };
      }

      const logError = e => console.log("error", e, typeof e); // eslint-disable-line no-console

      const onSuccess = stream => {
        Webcam.mountedInstances.forEach(instance =>
          instance.handleUserMedia(stream)
        );
      };

      const onError = e => {
        logError(e);
        Webcam.mountedInstances.forEach(instance => instance.handleError(e));
      };

      getUserMedia(constraints)
        .then(onSuccess)
        .catch(onError);
    };

    if (this.props.audioSource && this.props.videoSource) {
      sourceSelected(this.props.audioSource, this.props.videoSource);
    } else if ("mediaDevices" in navigator) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          let audioSource = null;
          let videoSource = null;

          devices.forEach(device => {
            if (device.kind === "audio") {
              audioSource = device.id;
            } else if (device.kind === "video") {
              videoSource = device.id;
            }
          });

          sourceSelected(audioSource, videoSource);
        })
        .catch(error => {
          console.log(`${error.name}: ${error.message}`); // eslint-disable-line no-console
        });
    }

    Webcam.userMediaRequested = true;
  }

  handleError(error) {
    this.setState({
      hasUserMedia: false,
    });
    this.props.onFailure(error);
  }

  handleUserMedia(stream) {
    this.stream = stream;
    // Theoretically, this should be handled by setting the stream in state however
    // HTMLMediaElement.srcObject can only be set by JS proprerty and not as a HTML attribute
    // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
    this.videoElement.srcObject = stream;
    this.setState({
      hasUserMedia: true,
    });

    this.props.onUserMedia();
  }

  getScreenshot() {
    if (!this.state.hasUserMedia) {
      return null;
    }

    const canvas = this.getCanvas();
    return canvas.toDataURL(this.props.screenshotFormat);
  }

  getCanvas() {
    if (!this.state.hasUserMedia) {
      return null;
    }

    const video = this.videoElement;

    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }

    const { canvas } = this;

    if (!this.ctx) {
      this.ctx = canvas.getContext("2d");
    }

    const { ctx } = this;

    // This is set every time in case the video element has resized
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  render() {
    return (
      <video
        autoPlay
        playsInline
        ref={video => {
          this.videoElement = video;
        }}
        width={this.props.width}
        height={this.props.height}
        muted={this.props.muted}
        className={this.props.className}
        style={this.props.style}
      />
    );
  }
}
