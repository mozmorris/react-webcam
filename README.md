# react-webcam

[![Build Status][build-badge]][build]
![downloads][downloads-badge]

<img src="Logotype primary.png" width="70%" height="70%" />

Webcam component for React. See [this](http://caniuse.com/#feat=stream)
for browser compatibility.

Note: Browsers will throw an error if the page is loaded from insecure origin. I.e. Use https.

## Installation

```
npm install react-webcam
```

## Demo

https://codepen.io/mozmorris/pen/JLZdoP

## Usage

```javascript
import React from "react";
import Webcam from "react-webcam";

class Component extends React.Component {
  render() {
    return <Webcam />;
  }
}
```

### Props

The props here are specific to this component but one can pass any prop to the underlying video tag eg `className` or `style`

| prop                | type     | default      | notes                                                                                   |
| -----------------   | -------- | ------------ | --------------------------------------------------------------------------------------- |
| audio               | boolean  | true         | enable/disable audio                                                                    |
| audioConstraints    | object   |              | MediaStreamConstraint(s) for the audio                                                  |
| imageSmoothing      | boolean  | true         | pixel smoothing of the screenshot taken                                                 å|
| minScreenshotHeight | number   |              | min height of screenshot                                                                |
| minScreenshotWidth  | number   |              | min width of screenshot                                                                 |
| onUserMedia         | function | noop         | callback for when component receives a media stream                                     |
| onUserMediaError    | function | noop         | callback for when component can't receive a media stream with MediaStreamError param    |
| screenshotFormat    | string   | 'image/webp' | format of screenshot                                                                    |
| screenshotQuality   | number   | 0.92         | quality of screenshot(0 to 1)                                                           |
| videoConstraints    | object   |              | MediaStreamConstraints(s) for the video                                                 |

### Methods

`getScreenshot` - Returns a base64 encoded string of the current webcam image. Example:

```javascript
class WebcamCapture extends React.Component {
  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };

    return (
      <div>
        <Webcam
          audio={false}
          height={720}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
        />
        <button onClick={this.capture}>Capture photo</button>
      </div>
    );
  }
}
```

## Choosing a camera

### User/Selfie/forward facing camera

```javascript
class WebcamCapture extends React.Component {
  render() {
    const videoConstraints = {
      facingMode: "user"
    };

    return <Webcam videoConstraints={videoConstraints} />;
  }
}
```

### Environment/Facing-Out camera

```javascript
class WebcamCapture extends React.Component {
  render() {
    const videoConstraints = {
      facingMode: { exact: "environment" }
    };

    return <Webcam videoConstraints={videoConstraints} />;
  }
}
```

For more information on `facingMode`, please see the MDN web docs [https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode)

## Using within an iframe

The Webcam component will fail to load when used inside a cross-origin iframe in newer version of Chrome (> 64). In order to overcome this security restriction a special `allow` attribute needs to be added to the iframe tag specifying `microphone` and `camera` as the required permissions like in the below example:

```
<iframe src="https://my-website.com/page-with-webcam" allow="camera; microphone;"/>
```

## License

MIT

[build-badge]: https://img.shields.io/travis/com/mozmorris/react-webcam.svg?style=flat-square
[build]: https://travis-ci.com/mozmorris/react-webcam
[downloads-badge]: https://img.shields.io/npm/dw/react-webcam.svg?style=flat-square
