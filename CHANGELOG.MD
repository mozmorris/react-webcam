### Added
- Add onFailure callback for when the camera cannot be accessed.

### Changed
- Update to `mediaDevices.getUserMedia`.
- `getUserMedia` and the video element are passed the width and height props of the component.
- `getCanvas` returns a canvas with the same size as the video element.
