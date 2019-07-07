import React, { Component } from 'react';
import PropTypes from 'prop-types';

function hasGetUserMedia() {
  return !!(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia
    || navigator.msGetUserMedia
  );
}

const constrainStringType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
  PropTypes.shape({
    exact: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  PropTypes.shape({
    ideal: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
]);

const constrainBooleanType = PropTypes.oneOfType([
  PropTypes.shape({
    exact: PropTypes.bool,
  }),
  PropTypes.shape({
    ideal: PropTypes.bool,
  }),
]);

const constrainLongType = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.shape({
    exact: PropTypes.number,
    ideal: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
  }),
]);

const constrainDoubleType = constrainLongType;

const audioConstraintType = PropTypes.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  autoGainControl: constrainBooleanType,
  channelCount: constrainLongType,
  latency: constrainDoubleType,
  noiseSuppression: constrainBooleanType,
  sampleRate: constrainLongType,
  sampleSize: constrainLongType,
  volume: constrainDoubleType,
});

const videoConstraintType = PropTypes.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  aspectRatio: constrainDoubleType,
  facingMode: constrainStringType,
  frameRate: constrainDoubleType,
  height: constrainLongType,
  width: constrainLongType,
});

const propTypes = {
  audio: PropTypes.bool,
  onUserMedia: PropTypes.func,
  onUserMediaError: PropTypes.func,
  screenshotFormat: PropTypes.oneOf(['image/webp', 'image/png', 'image/jpeg']),
  screenshotQuality: PropTypes.number,
  minScreenshotWidth: PropTypes.number,
  minScreenshotHeight: PropTypes.number,
  audioConstraints: audioConstraintType,
  videoConstraints: videoConstraintType,
  imageSmoothing: PropTypes.bool,
};

export default class Webcam extends Component {
  static defaultProps = {
    audio: true,
    imageSmoothing: true,
    onUserMedia: () => {},
    onUserMediaError: () => {},
    screenshotFormat: 'image/webp',
    screenshotQuality: 0.92,
  };

  static propTypes = propTypes;

  static mountedInstances = [];

  static userMediaRequested = false;

  constructor() {
    super();
    this.state = {
      hasUserMedia: false,
    };
  }

  componentDidMount() {
    if (!hasGetUserMedia()) return;

    const { state } = this;

    Webcam.mountedInstances.push(this);

    if (!state.hasUserMedia && !Webcam.userMediaRequested) {
      this.requestUserMedia();
    }
  }

  componentDidUpdate(nextProps) {
    const { props } = this;
    if (
      JSON.stringify(nextProps.audioConstraints)
        !== JSON.stringify(props.audioConstraints)
      || JSON.stringify(nextProps.videoConstraints)
        !== JSON.stringify(props.videoConstraints)
    ) {
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
        this.stream.stop();
      }
      window.URL.revokeObjectURL(state.src);
    }
  }

  getScreenshot() {
    const { state, props } = this;

    if (!state.hasUserMedia) return null;

    const canvas = this.getCanvas();
    return (
      canvas
      && canvas.toDataURL(
        props.screenshotFormat,
        props.screenshotQuality,
      )
    );
  }

  getCanvas() {
    const { state, props } = this;

    if (!state.hasUserMedia || !this.video.videoHeight) return null;

    if (!this.ctx) {
      const canvas = document.createElement('canvas');
      const aspectRatio = this.video.videoWidth / this.video.videoHeight;

      let canvasWidth = props.minScreenshotWidth || this.video.clientWidth;
      let canvasHeight = canvasWidth / aspectRatio;

      if (props.minScreenshotHeight && (canvasHeight < props.minScreenshotHeight)) {
        canvasHeight = props.minScreenshotHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }

    const { ctx, canvas } = this;
    ctx.imageSmoothingEnabled = props.imageSmoothing;
    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  requestUserMedia() {
    const { props } = this;

    navigator.getUserMedia = navigator.mediaDevices.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia;

    const sourceSelected = (audioConstraints, videoConstraints) => {
      const constraints = {
        video: typeof videoConstraints !== 'undefined' ? videoConstraints : true,
      };

      if (props.audio) {
        constraints.audio = typeof audioConstraints !== 'undefined' ? audioConstraints : true;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          Webcam.mountedInstances.forEach(instance => instance.handleUserMedia(null, stream));
        })
        .catch((e) => {
          Webcam.mountedInstances.forEach(instance => instance.handleUserMedia(e));
        });
    };

    if ('mediaDevices' in navigator) {
      sourceSelected(props.audioConstraints, props.videoConstraints);
    } else {
      const optionalSource = id => ({ optional: [{ sourceId: id }] });

      const constraintToSourceId = (constraint) => {
        const { deviceId } = constraint || {};

        if (typeof deviceId === 'string') {
          return deviceId;
        }

        if (Array.isArray(deviceId) && deviceId.length > 0) {
          return deviceId[0];
        }

        if (typeof deviceId === 'object' && deviceId.ideal) {
          return deviceId.ideal;
        }

        return null;
      };

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
          optionalSource(videoSource),
        );
      });
    }

    Webcam.userMediaRequested = true;
  }

  handleUserMedia(err, stream) {
    const { props } = this;

    if (err) {
      this.setState({ hasUserMedia: false });
      props.onUserMediaError(err);

      return;
    }

    this.stream = stream;

    try {
      this.video.srcObject = stream;
      this.setState({ hasUserMedia: true });
    } catch (error) {
      this.setState({
        hasUserMedia: true,
        src: window.URL.createObjectURL(stream),
      });
    }

    props.onUserMedia();
  }

  render() {
    const { state, props } = this;

    const passThroughProps = Object.entries(props).reduce((result, [key, value]) => {
      if (Object.prototype.hasOwnProperty.call(propTypes, key)) {
        return result;
      }

      return {
        ...result,
        [key]: value,
      };
    },
    {});

    return (
      <video
        autoPlay
        src={state.src}
        muted={props.audio}
        playsInline
        ref={(ref) => {
          this.video = ref;
        }}
        {...passThroughProps}
      />
    );
  }
}
