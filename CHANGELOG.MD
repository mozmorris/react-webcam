## 0.0.19

### Fixed
- Fix for firefox when requested resolution is higher than available resolution

### Removed
- Removed support for `navigator.getUserMedia`, only `navigator.mediaDevices.getUserMedia` is supported. This is due to too many inconsistencies in the `getUserMedia` api.


## 0.0.18

### Added
- Add onFailure callback for when the camera cannot be accessed.

### Changed
- Update to `mediaDevices.getUserMedia`.


## 0.0.17

### Changed
- `getUserMedia` and the video element are passed the width and height props of the component.
- `getCanvas` returns a canvas with the same size as the video element.
