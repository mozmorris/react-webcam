import * as React from "react";

function hasGetUserMedia() {
  return !!(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
}

interface WebcamProps {
  audio: boolean;
  audioConstraints?: MediaStreamConstraints["audio"];
  imageSmoothing: boolean;
  mirrored?: boolean;
  minScreenshotHeight?: number;
  minScreenshotWidth?: number;
  onUserMedia: () => void;
  onUserMediaError: (error: string) => void;
  screenshotFormat: "image/webp" | "image/png" | "image/jpeg";
  screenshotQuality: number;
  videoConstraints?: MediaStreamConstraints["video"];
}

interface WebcamState {
  hasUserMedia: boolean;
  src?: string;
}

export default class Webcam extends React.Component<WebcamProps & React.HTMLAttributes<HTMLVideoElement>, WebcamState> {
  static defaultProps = {
    audio: true,
    imageSmoothing: true,
    mirrored: false,
    onUserMedia: () => { },
    onUserMediaError: () => { },
    screenshotFormat: "image/webp",
    screenshotQuality: 0.92,
  };

  static mountedInstances: Webcam[] = [];

  static userMediaRequested = false;

  canvas: HTMLCanvasElement | null = null;

  ctx: CanvasRenderingContext2D | null = null;

  stream: MediaStream;

  video: HTMLVideoElement | null;

  constructor(props) {
    super(props);
    this.state = {
      hasUserMedia: false
    };
  }

  componentDidMount() {
    const { state, props } = this;

    if (!hasGetUserMedia()) {
      props.onUserMediaError("getUserMedia not supported");

      return;
    }

    Webcam.mountedInstances.push(this);

    if (!state.hasUserMedia && !Webcam.userMediaRequested) {
      this.requestUserMedia();
    }
  }

  componentDidUpdate(nextProps) {
    const { props } = this;

    if (!hasGetUserMedia()) {
      props.onUserMediaError("getUserMedia not supported");

      return;
    }

    const audioConstraintsChanged =
      JSON.stringify(nextProps.audioConstraints) !==
      JSON.stringify(props.audioConstraints);
    const videoConstraintsChanged =
      JSON.stringify(nextProps.videoConstraints) !==
      JSON.stringify(props.videoConstraints);
    const minScreenshotWidthChanged =
      nextProps.minScreenshotWidth !== props.minScreenshotWidth;
    const minScreenshotHeightChanged =
      nextProps.minScreenshotHeight !== props.minScreenshotHeight;
    if (
      videoConstraintsChanged ||
      minScreenshotWidthChanged ||
      minScreenshotHeightChanged
    ) {
      this.canvas = null;
      this.ctx = null;
    }
    if (audioConstraintsChanged || videoConstraintsChanged) {
      this.requestUserMedia();
    }
  }

  componentWillUnmount() {
    const { state } = this;
    const index = Webcam.mountedInstances.indexOf(this);
    Webcam.mountedInstances.splice(index, 1);

    Webcam.userMediaRequested = false;
    if (Webcam.mountedInstances.length === 0 && state.hasUserMedia) {
      if (this.stream.getVideoTracks && this.stream.getAudioTracks) {
        this.stream.getVideoTracks().map(track => track.stop());
        this.stream.getAudioTracks().map(track => track.stop());
      } else {
        ((this.stream as unknown) as MediaStreamTrack).stop();
      }

      if (state.src) {
        window.URL.revokeObjectURL(state.src);
      }
    }
  }

  getScreenshot() {
    const { state, props } = this;

    if (!state.hasUserMedia) return null;

    const canvas = this.getCanvas();
    return (
      canvas &&
      canvas.toDataURL(props.screenshotFormat, props.screenshotQuality)
    );
  }

  getCanvas() {
    const { state, props } = this;

    if (!this.video) {
      return null;
    }

    if (!state.hasUserMedia || !this.video.videoHeight) return null;

    if (!this.ctx) {
      const canvas = document.createElement("canvas");
      const aspectRatio = this.video.videoWidth / this.video.videoHeight;

      let canvasWidth = props.minScreenshotWidth || this.video.clientWidth;
      let canvasHeight = canvasWidth / aspectRatio;

      if (
        props.minScreenshotHeight &&
        canvasHeight < props.minScreenshotHeight
      ) {
        canvasHeight = props.minScreenshotHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
    }

    const { ctx, canvas } = this;

    if (ctx && canvas) {
      // mirror the screenshot
      if (props.mirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.imageSmoothingEnabled = props.imageSmoothing;
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

      // invert mirroring
      if (props.mirrored) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
    }

    return canvas;
  }

  requestUserMedia() {
    const { props } = this;

    navigator.getUserMedia =
      navigator.mediaDevices.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    const sourceSelected = (audioConstraints, videoConstraints) => {
      const constraints: MediaStreamConstraints = {
        video: typeof videoConstraints !== "undefined" ? videoConstraints : true
      };

      if (props.audio) {
        constraints.audio =
          typeof audioConstraints !== "undefined" ? audioConstraints : true;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          Webcam.mountedInstances.forEach(instance =>
            instance.handleUserMedia(null, stream)
          );
        })
        .catch(e => {
          Webcam.mountedInstances.forEach(instance =>
            instance.handleUserMedia(e)
          );
        });
    };

    if ("mediaDevices" in navigator) {
      sourceSelected(props.audioConstraints, props.videoConstraints);
    } else {
      const optionalSource = id => ({ optional: [{ sourceId: id }] });

      const constraintToSourceId = constraint => {
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

      // @ts-ignore: deprecated api
      MediaStreamTrack.getSources(sources => {
        let audioSource = null;
        let videoSource = null;

        sources.forEach(source => {
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

    Webcam.userMediaRequested = true;
  }

  handleUserMedia(err, stream?: MediaStream) {
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

    props.onUserMedia();
  }

  render() {
    const { state, props } = this;

    const {
      audio,
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
      ...rest
    } = props;

    const videoStyle = mirrored ? { ...style, transform: `${style.transform || ""} scaleX(-1)` } : style;

    return (
      <video
        autoPlay
        src={state.src}
        muted={audio}
        playsInline
        ref={ref => {
          this.video = ref;
        }}
        style={videoStyle}
        {...rest}
      />
    );
  }
}
