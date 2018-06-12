/* @flow */
import React, { Component } from 'react';
import { createMediaRecorder, startRecording } from './video';

/*
Deliberately ignoring the old api, due to very inconsistent behaviour
*/
const mediaDevices = navigator.mediaDevices;
const getUserMedia = mediaDevices && mediaDevices.getUserMedia ? mediaDevices.getUserMedia.bind(mediaDevices) : null;
const hasGetUserMedia = !!(getUserMedia);

const DEBUG = false;
const debugConsole = (...args) => {
  if (DEBUG) console.log(...args);
};

type constraintTypes = number | Object;

type CameraType = {
  audio?: boolean,
  onUserMedia: Function,
  onFailure: Function,
  height?: constraintTypes,
  width?: constraintTypes,
  facingMode?: String,
  screenshotFormat?: 'image/webp' |
    'image/png' |
    'image/jpeg'
  ,
  className?: String
}

type State = {
  hasUserMedia: boolean,
  mirrored: boolean
}

export default class Webcam extends Component<CameraType, State> {
  static defaultProps = {
    audio: false,
    screenshotFormat: 'image/webp',
    onUserMedia: () => {},
    onFailure: () => {}
  };

  static mountedInstances = [];

  state = {
    hasUserMedia: false,
    mirrored: false
  };

  stream: MediaStream
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  video: ?HTMLVideoElement
  recordedBlobs: Array<any>
  mediaRecorder: Object

  constructor(props: CameraType) {
    super(props);

    if (!hasGetUserMedia) {
      const error = new Error('getUserMedia is not supported by this browser');
      this.props.onFailure(error);
    }
  }

  componentDidMount() {
    Webcam.mountedInstances.push(this);
    this.requestUserMedia();
  }

  requestUserMedia() {
    if (!getUserMedia || !mediaDevices) return;
    const { facingMode, audio } = this.props;
    /*
    Safari 11 has a bug where if you specify both the height and width
    constraints you must chose a resolution supported by the web cam. If an
    unsupported resolution is used getUserMedia(constraints) will hit a
    OverconstrainedError complaining that width is an invalid constraint.
    This bug exists for ideal constraints as well as min and max.

    However if only a height is specified safari will correctly chose the
    nearest resolution supported by the web cam.

    Reference: https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints
    */

    // if `{facingMode: 'user'}` Firefox will still allow the user to choose which camera to use (Front camera will be the first option)
    // if `{facingMode: {exact: 'user'}}` Firefox won't give the user a choice and will show the front camera
    const constraints = {video: {facingMode}, audio};

    const logError = e => console.log('error', e, typeof e);

    const onSuccess = stream => {
      Webcam.mountedInstances.forEach((instance) => instance.handleUserMedia(stream));
    };

    const onError = e => {
      logError(e);
      Webcam.mountedInstances.forEach((instance) => instance.handleError(e));
    };
    getUserMedia(constraints).then(onSuccess).catch(onError);
  }

  handleError(error: Object) {
    this.setState({
      hasUserMedia: false
    });
    this.props.onFailure(error);
  }

  handleUserMedia(stream: MediaStream) {
    this.stream = stream;
    const videoSettings = stream.getVideoTracks()[0].getSettings();
    debugConsole('video track settings', videoSettings);
    this.setState({
      hasUserMedia: true,
      mirrored: videoSettings.facingMode === 'user'
                /* #HACK desktop cameras seem to have `facingMode` undefined,
                therefore we are assuming all desktop cameras are user facing*/
                || !videoSettings.facingMode
    });

    this.props.onUserMedia();
  }

  componentWillUnmount() {
    const index = Webcam.mountedInstances.indexOf(this);
    Webcam.mountedInstances.splice(index, 1);

    if (Webcam.mountedInstances.length === 0 && this.state.hasUserMedia) {
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
  }

  getScreenshot() {
    const canvas = this.getCanvas();
    if (!canvas) return null;
    return canvas.toDataURL(this.props.screenshotFormat);
  }

  getCanvas(): HTMLCanvasElement | null {
    if (!this.state.hasUserMedia || !this.video) return null;

    const video = this.video;

    if (!this.canvas) this.canvas = document.createElement('canvas');
    const { canvas } = this;

    if (!this.ctx) this.ctx = canvas.getContext('2d');
    const { ctx } = this;

    // This is set every time incase the video element has resized
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    debugConsole(`drawn image to canvas: ${canvas.width}x${canvas.height}`);
    return canvas;
  }

  startRecording() {
    this.mediaRecorder = createMediaRecorder(this.stream);
    this.recordedBlobs = startRecording(this.mediaRecorder);
  }

  stopRecording() {
    this.mediaRecorder.stop(this.recordedBlobs);
  }

  getVideoBlob() {
    return new Blob(this.recordedBlobs);
  }

  render() {
    return (
      <video
        style={{
          // not necessary to add prefixes, since all browsers that support camera
          // support transform
          transform: this.state.mirrored ? 'scaleX(-1)' : ''
        }}
        height={this.props.height}
        width={this.props.width}
        ref={(el) => this.video = el}
        autoPlay
        playsinline// necessary for iOS, see https://github.com/webrtc/samples/issues/929
        srcObject={this.stream}
        muted={true} // muted must be true for recording and reproducing videos. Also there is no use case where we want the video element to reproduce any audio
        className={this.props.className}
      />
    );
  }
}
