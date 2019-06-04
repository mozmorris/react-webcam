import React from 'react';
import renderer from 'react-test-renderer';
import Webcam from '../react-webcam';

it('renders correctly', () => {
  const tree = renderer
    .create(<Webcam />)
    .toJSON();

  expect(tree).toMatchSnapshot();
});
