# react-webcam

[![Build Status][build-badge]][build]
![downloads][downloads-badge]

<img src="Logotype primary.png" width="70%" height="70%" />

**DEMO:** https://codepen.io/mozmorris/pen/JLZdoP

https://www.npmjs.com/package/react-webcam

Webcam component for React. See [http://caniuse.com/#feat=stream](http://caniuse.com/#feat=stream)
for browser compatibility.

**Note: Browsers will throw an error if the page is loaded from insecure origin. I.e. Use https.**

## Installation

```shell
# with npm
npm install react-webcam

# with yarn
yarn add react-webcam
```

## Demo

https://codepen.io/mozmorris/pen/JLZdoP

## Usage

```jsx
import React from "react";
import Webcam from "react-webcam";

const WebcamComponent = () => <Webcam />;
```

### Props

The props here are specific to this component but one can pass any prop to the underlying video tag eg `className`, `style`, `muted`, etc

| prop                      | type     | default      | notes                                                                                   |
| ------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------- |
| audio                     | boolean  | false        | enable/disable audio                                                                    |
| audioConstraints          | object   |              | MediaStreamConstraint(s) for the audio                                                  |
| forceScreenshotSourceSize | boolean  | false        | uses size of underlying source video stream (and thus ignores other size related props) |
| imageSmoothing            | boolean  | true         | pixel smoothing of the screenshot taken                                                 |
| mirrored                  | boolean  | false        | show camera preview and get the screenshot mirrored                                     |
| minScreenshotHeight       | number   |              | min height of screenshot                                                                |
| minScreenshotWidth        | number   |              | min width of screenshot                                                                 |
| onUserMedia               | function | noop         | callback for when component receives a media stream                                     |
| onUserMediaError          | function | noop         | callback for when component can't receive a media stream with MediaStreamError param    |
| screenshotFormat          | string   | 'image/webp' | format of screenshot                                                                    |
| screenshotQuality         | number   | 0.92         | quality of screenshot(0 to 1)                                                           |
| videoConstraints          | object   |              | MediaStreamConstraints(s) for the video                                                 |

### Methods

`getScreenshot` - Returns a base64 encoded string of the current webcam image. Example:

[https://codepen.io/mozmorris/pen/gOOoqpw](https://codepen.io/mozmorris/pen/gOOoqpw)

You may also pass in an optional `dimensions` object:

```
getScreenshot({width: 1920, height: 1080});
```

### The Constraints

We can build a constraints object by passing it to the videoConstraints prop. This gets passed into getUserMedia method. Please take a look at the MDN docs to get an understanding how this works.

https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API/Constraints

As an example take a look at this [CodePen demo https://codepen.io/mozmorris/pen/GRpEQwK?editors=0010](https://codepen.io/mozmorris/pen/GRpEQwK?editors=0010) which shows how to build a custom aspect ratio for the video.

```jsx
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

const WebcamCapture = () => {
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot();
    },
    [webcamRef]
  );

  return (
    <>
      <Webcam
        audio={false}
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture photo</button>
    </>
  );
};
```

## Capturing video

It is posible to capture video with `<Webcam />` using the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API).

You can find an example [https://codepen.io/mozmorris/pen/yLYKzyp?editors=0010](https://codepen.io/mozmorris/pen/yLYKzyp?editors=0010).

## Choosing a camera

### User/Selfie/forward facing camera

```jsx
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

```jsx
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

## Show all cameras by deviceId

```jsx
const WebcamCapture = () => {
  const [deviceId, setDeviceId] = React.useState({});
  const [devices, setDevices] = React.useState([]);

  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  return (
    <>
      {devices.map((device, key) => (
          <div>
            <Webcam audio={false} videoConstraints={{ deviceId: device.deviceId }} />
            {device.label || `Device ${key + 1}`}
          </div>

        ))}
    </>
  );
};
```

## Recording a stream

https://codepen.io/mozmorris/pen/yLYKzyp?editors=0011

## Using within an iframe

The Webcam component will fail to load when used inside a cross-origin iframe in newer version of Chrome (> 64). In order to overcome this security restriction a special `allow` attribute needs to be added to the iframe tag specifying `microphone` and `camera` as the required permissions like in the below example:

```html
<iframe src="https://my-website.com/page-with-webcam" allow="camera; microphone;"/>
```

## License

MIT

[build-badge]: https://img.shields.io/travis/com/mozmorris/react-webcam.svg?style=flat-square
[build]: https://travis-ci.com/mozmorris/react-webcam
[downloads-badge]: https://img.shields.io/npm/dw/react-webcam.svg?style=flat-square
