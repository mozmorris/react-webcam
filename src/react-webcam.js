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
      const { width, height } = this.props;

      /* There is an inconsistency between Chrome v58 and Firefox
      `exact` resolution constraint works in a different way to firefox. If the requested `exact` resolution is higher than the supported webcam resolution then Chrome will upscale.
      However Firefox will trigger an OverConstraintError. I suspect Firefox is following the standard

      In case a non exact resolution is requested, instead an `ideal` is, Firefox will handle all cases gracefully and prepare a resolution which is as close as possible to the requested one.
      If the supported webcam resolution is higher than the requested one, then it downscales;
      if it's lower, then it gives the highest available.
      However, Chrome will just give the lowest resolution of the webcam, this seems like a bug.

      Therefore, if one wants the ideal constraint functionality, the `exact` constraint works best on Chrome and the ideal one best on Firefox.

      This lead us to use the `advanced` constraint to create a list of potential constraint fallbacks.
      The weird thing is, that Chrome seems to work well with `ideal` if the constraint is defined as list element in `advanced`.
      Which means that setting a list with multiple fallbacks is not necessary, but setting the one constaint in `advance` is.

      The problem is that Firefox does not work with ideal well if advanced is used,
      which means the ideal needs to go on the parent constraint, together with advanced for Chome.

      ref: https://webrtchacks.com/getusermedia-resolutions-3/
      ref: https://w3c.github.io/mediacapture-main/getusermedia.html#constrainable-interface
      ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      ref: https://github.com/webrtc/adapter/issues/408 They discuss the Chrome bug
      ref: https://bugs.chromium.org/p/chromium/issues/detail?id=682887 the actual chrome bug
       */
      const constraints = {
        video: {
          sourceId: videoSource,
          width,
          height, // Necessary to get Firefox to work with ideal resolutions
          advanced: [{ width, height }], // Necessary to get Chrome to work with ideal resolutions
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

Webcam.propTypes = {
  audio: PropTypes.bool,
  muted: PropTypes.bool,
  onUserMedia: PropTypes.func,
  onFailure: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  screenshotFormat: PropTypes.oneOf(["image/webp", "image/png", "image/jpeg"]),
  style: PropTypes.object,
  className: PropTypes.string,
  audioSource: PropTypes.string,
  videoSource: PropTypes.string,
};
