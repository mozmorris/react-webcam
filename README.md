# react-webcam

Webcam component for React. See [this](http://caniuse.com/#feat=stream)
for browser compatibility.

## Installation

```
npm install react-webcam
```

## Demo

https://codepen.io/mozmorris/pen/JLZdoP

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
audio            | boolean  | true         | enable/disable audio
height           | number   | 480          | height of video element
width            | number   | 640          | width of video element
style            | object   |              | style prop passed to video element
screenshotFormat | string   | 'image/webp' | format of screenshot
onUserMedia      | function | noop         | callback when component receives a media stream
audioSource      | string   |              | an array or single ConstrainDOMString(s) specifying the device id
videoSource      | string   |              | an array or single ConstrainDOMString(s) specifying the device id

### Methods

`getScreenshot` - Returns a base64 encoded string of the current webcam image. Example:

```javascript
class WebcamCapture extends React.Component {
  setRef = (webcam) => {
    this.webcam = webcam;
  }

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
  };

  render() {
    return (
      <div>
        <Webcam
          audio={false}
          height={350}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={350}
        />
        <button onClick={this.capture}>Capture photo</button>
      </div>
    );
  }
}
```

## License

MIT

## Credits

Many thanks to @cezary for his work on this component.
