# react-webcam

Webcam component for React. See [this](http://caniuse.com/#feat=stream)
for browser compatibility.

## Installation

```
npm install react-webcam
```

## Demo

https://cezary.github.io/react-webcam/examples (if demo doesn't work, check browser compatibility and verify browser is using https)

## Usage

```javascript
import React from 'react';
import Webcam from 'react-webcam';

class Component extends React.Component {
  render() {
    return <Webcam/>;
  }
}
```

### Props

prop             | type     | default      | notes
-----------------|----------|--------------|----------
className        | string   | ''           | CSS class of video element
audio            | boolean  | false        | enable/disable audio
height           | number   | 480          | height of video element
width            | number   | 640          | width of video element
facingMode       | string   | ''           | Facing mode of the camera. It can be `user` or `environment`
screenshotFormat | string   | 'image/webp' | format of screenshot
onUserMedia      | function | noop         | callback when component receives a media stream
onFailure        | function | noop         | Callback in case an error happens, no getUserMedia for example

## Global functions

function         | notes
-----------------|----------
getScreenshot    | returns one frame of the stream
getCanvas        | returns a canvas with the same size as the video element
startRecording   | starts the recording  
stopRecording    | stops the recording
getVideoBlob     | returns the video blob for the recorded video


## License

MIT
