(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("react")) : typeof define === "function" && define.amd ? define(["react"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Webcam = factory(global.React));
})(this, (function(React) {
  "use strict";
  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
    if (e) {
      for (const k in e) {
        if (k !== "default") {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }
  const React__namespace = /* @__PURE__ */ _interopNamespaceDefault(React);
  (function polyfillGetUserMedia() {
    if (typeof window === "undefined") {
      return;
    }
    if (navigator.mediaDevices === void 0) {
      navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === void 0) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(
            new Error("getUserMedia is not implemented in this browser")
          );
        }
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  })();
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  const _Webcam = class _Webcam extends React__namespace.Component {
    constructor(props) {
      super(props);
      this.canvas = null;
      this.ctx = null;
      this.requestUserMediaId = 0;
      this.unmounted = false;
      this.state = {
        hasUserMedia: false
      };
    }
    componentDidMount() {
      const { state, props } = this;
      this.unmounted = false;
      if (!hasGetUserMedia()) {
        props.onUserMediaError("getUserMedia not supported");
        return;
      }
      if (!state.hasUserMedia) {
        this.requestUserMedia();
      }
      if (props.children && typeof props.children != "function") {
        console.warn("children must be a function");
      }
    }
    componentDidUpdate(nextProps) {
      const { props } = this;
      if (!hasGetUserMedia()) {
        props.onUserMediaError("getUserMedia not supported");
        return;
      }
      const audioConstraintsChanged = JSON.stringify(nextProps.audioConstraints) !== JSON.stringify(props.audioConstraints);
      const videoConstraintsChanged = JSON.stringify(nextProps.videoConstraints) !== JSON.stringify(props.videoConstraints);
      const minScreenshotWidthChanged = nextProps.minScreenshotWidth !== props.minScreenshotWidth;
      const minScreenshotHeightChanged = nextProps.minScreenshotHeight !== props.minScreenshotHeight;
      if (videoConstraintsChanged || minScreenshotWidthChanged || minScreenshotHeightChanged) {
        this.canvas = null;
        this.ctx = null;
      }
      if (audioConstraintsChanged || videoConstraintsChanged) {
        this.stopAndCleanup();
        this.requestUserMedia();
      }
    }
    componentWillUnmount() {
      this.unmounted = true;
      this.stopAndCleanup();
    }
    static stopMediaStream(stream) {
      if (stream) {
        if (stream.getVideoTracks && stream.getAudioTracks) {
          stream.getVideoTracks().map((track) => {
            stream.removeTrack(track);
            track.stop();
          });
          stream.getAudioTracks().map((track) => {
            stream.removeTrack(track);
            track.stop();
          });
        } else {
          stream.stop();
        }
      }
    }
    stopAndCleanup() {
      const { state } = this;
      if (state.hasUserMedia) {
        _Webcam.stopMediaStream(this.stream);
        if (state.src) {
          window.URL.revokeObjectURL(state.src);
        }
      }
    }
    getScreenshot(screenshotDimensions) {
      const { state, props } = this;
      if (!state.hasUserMedia) return null;
      const canvas = this.getCanvas(screenshotDimensions);
      return canvas && canvas.toDataURL(props.screenshotFormat, props.screenshotQuality);
    }
    getCanvas(screenshotDimensions) {
      const { state, props } = this;
      if (!this.video) {
        return null;
      }
      if (!state.hasUserMedia || !this.video.videoHeight) return null;
      if (!this.ctx) {
        let canvasWidth = this.video.videoWidth;
        let canvasHeight = this.video.videoHeight;
        if (!this.props.forceScreenshotSourceSize) {
          const aspectRatio = canvasWidth / canvasHeight;
          canvasWidth = props.minScreenshotWidth || this.video.clientWidth;
          canvasHeight = canvasWidth / aspectRatio;
          if (props.minScreenshotHeight && canvasHeight < props.minScreenshotHeight) {
            canvasHeight = props.minScreenshotHeight;
            canvasWidth = canvasHeight * aspectRatio;
          }
        }
        this.canvas = document.createElement("canvas");
        this.canvas.width = screenshotDimensions?.width || canvasWidth;
        this.canvas.height = screenshotDimensions?.height || canvasHeight;
        this.ctx = this.canvas.getContext("2d");
      }
      const { ctx, canvas } = this;
      if (ctx && canvas) {
        canvas.width = screenshotDimensions?.width || canvas.width;
        canvas.height = screenshotDimensions?.height || canvas.height;
        if (props.mirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.imageSmoothingEnabled = props.imageSmoothing;
        ctx.drawImage(this.video, 0, 0, screenshotDimensions?.width || canvas.width, screenshotDimensions?.height || canvas.height);
        if (props.mirrored) {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
      }
      return canvas;
    }
    requestUserMedia() {
      const { props } = this;
      const sourceSelected = (audioConstraints, videoConstraints) => {
        const constraints = {
          video: typeof videoConstraints !== "undefined" ? videoConstraints : true
        };
        if (props.audio) {
          constraints.audio = typeof audioConstraints !== "undefined" ? audioConstraints : true;
        }
        this.requestUserMediaId++;
        const myRequestUserMediaId = this.requestUserMediaId;
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
          if (this.unmounted || myRequestUserMediaId !== this.requestUserMediaId) {
            _Webcam.stopMediaStream(stream);
          } else {
            this.handleUserMedia(null, stream);
          }
        }).catch((e) => {
          this.handleUserMedia(e);
        });
      };
      if ("mediaDevices" in navigator) {
        sourceSelected(props.audioConstraints, props.videoConstraints);
      } else {
        const optionalSource = (id) => ({ optional: [{ sourceId: id }] });
        const constraintToSourceId = (constraint) => {
          const { deviceId } = constraint;
          if (typeof deviceId === "string") {
            return deviceId;
          }
          if (Array.isArray(deviceId) && deviceId.length > 0) {
            return deviceId[0];
          }
          if (typeof deviceId === "object" && deviceId.ideal) {
            return deviceId.ideal;
          }
          return null;
        };
        MediaStreamTrack.getSources((sources) => {
          let audioSource = null;
          let videoSource = null;
          sources.forEach((source) => {
            if (source.kind === "audio") {
              audioSource = source.id;
            } else if (source.kind === "video") {
              videoSource = source.id;
            }
          });
          const audioSourceId = constraintToSourceId(props.audioConstraints);
          if (audioSourceId) {
            audioSource = audioSourceId;
          }
          const videoSourceId = constraintToSourceId(props.videoConstraints);
          if (videoSourceId) {
            videoSource = videoSourceId;
          }
          sourceSelected(
            optionalSource(audioSource),
            optionalSource(videoSource)
          );
        });
      }
    }
    handleUserMedia(err, stream) {
      const { props } = this;
      if (err || !stream) {
        this.setState({ hasUserMedia: false });
        props.onUserMediaError(err);
        return;
      }
      this.stream = stream;
      try {
        if (this.video) {
          this.video.srcObject = stream;
        }
        this.setState({ hasUserMedia: true });
      } catch (error) {
        this.setState({
          hasUserMedia: true,
          src: window.URL.createObjectURL(stream)
        });
      }
      props.onUserMedia(stream);
    }
    render() {
      const { state, props } = this;
      const {
        audio,
        forceScreenshotSourceSize,
        disablePictureInPicture,
        onUserMedia,
        onUserMediaError,
        screenshotFormat,
        screenshotQuality,
        minScreenshotWidth,
        minScreenshotHeight,
        audioConstraints,
        videoConstraints,
        imageSmoothing,
        mirrored,
        style = {},
        children,
        ...rest
      } = props;
      const videoStyle = mirrored ? { ...style, transform: `${style.transform || ""} scaleX(-1)` } : style;
      const childrenProps = {
        getScreenshot: this.getScreenshot.bind(this)
      };
      return /* @__PURE__ */ React__namespace.createElement(React__namespace.Fragment, null, /* @__PURE__ */ React__namespace.createElement(
        "video",
        {
          autoPlay: true,
          disablePictureInPicture,
          src: state.src,
          muted: !audio,
          playsInline: true,
          ref: (ref) => {
            this.video = ref;
          },
          style: videoStyle,
          ...rest
        }
      ), children && children(childrenProps));
    }
  };
  _Webcam.defaultProps = {
    audio: false,
    disablePictureInPicture: false,
    forceScreenshotSourceSize: false,
    imageSmoothing: true,
    mirrored: false,
    onUserMedia: () => void 0,
    onUserMediaError: () => void 0,
    screenshotFormat: "image/webp",
    screenshotQuality: 0.92
  };
  let Webcam = _Webcam;
  return Webcam;
}));
//# sourceMappingURL=react-webcam.js.map
