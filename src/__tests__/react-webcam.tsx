import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Webcam from '../react-webcam';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Webcam
        audio={false}
        audioConstraints={{
          sampleSize: 8,
          echoCancellation: true
        }}
        className="react-webcam"
        imageSmoothing={false}
        minScreenshotHeight={1000}
        minScreenshotWidth={1000}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotFormat="image/png"
        screenshotQuality={1}
        style={{transform: 'rotate(180deg)'}}
        videoConstraints={{
          width: 160,
          height: 120,
          frameRate: 15
        }}
      />
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
