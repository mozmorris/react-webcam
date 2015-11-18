# react-webcam

Webcam component for React. See [this](http://caniuse.com/#feat=stream)
for browser compatibility.

## Installation

```
npm install react-webcam
```

## Demo

http://cezary.github.io/react-webcam/examples

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

* audio: boolean | Set to enable/disable audio. Default is true.
* height: number | Height of video element. Default is 480.
* width: number | Width of video element. Default is 640.
* screenshotFormat: 'string' | Format of screenshot. Default is
  'image/webp'.
* onUserMedia: function | Callback when component receives a media
  stream.
* className: 'string' | CSS class of video element. Default is empty.

## License

MIT
