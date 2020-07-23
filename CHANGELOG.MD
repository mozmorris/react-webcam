## 0.1.23
### Fixed
- Fixed issues introduced in versions 0.1.21 and 0.1.22. Fixed multiple rear cameras support

## 0.1.22
### Fixed
- Fixed missing constraint video object

## 0.1.21
### Fixed
- Support multiple rear cameras

## 0.1.19
### Added
- Added warning about Safari 13.1 bug that affects devices result from multiple calls to navigator.mediaDevices.enumerateDevices()

## 0.1.18
### Fixed
- Fixed camera stream not getting on some Android devices, e.g. Motorola G5, Samsung Galaxy A6

## 0.1.17
### Fixed
- Added label option to the Chrome workaround to support HP Elite X2

## 0.1.16
### Fixed
- Resolved the video stream mirroring problem for the rear camera on certain browsers

## 0.1.15
### Added
- Added alternative constraint workaround to evoke the rear camera of Surface Pro in Chrome since it will not respect facingMode constraint

## 0.1.14
### Fixed
- Added WebM container for VP8 video to include Opus audio so that MediaRecorder works for Firefox >= 71

## 0.1.13
### Added
- Check for stream first before trying for `getVideoTracks` or `getAudioTracks`

## 0.1.12
### Changed
- Internal: Upgraded to babel 7 and runtime to corejs3

## 0.1.11
### Added
- Public: Added 1s delay before releasing the webcam stream in order to mitigate the iOS issue where multiple re-mounting of the webcam component was causing a crash.

## 0.1.10
### Removed
- Public: Removed possibility to override the style of the video element by passing inline style as a prop

## 0.1.9
### Added
- Public: Added `style` prop style the video element inline

## 0.1.8
### Changed
- Public: Changed `getVideoBlob()` to return a Blob with `type`

## 0.1.7
### Changed
- Made `facingMode` a complex type rather than just `String`
- Internal: Flow check has been moved out of the linter

## 0.1.6

### Changed
- Fallback width and height definable via props
- A new fallback constraints object will created, omitting width and height if not defined in props

## 0.1.5

### Changed
- Width and height will be deleted from the cloned video object in fallback constraints.

## 0.1.4

### Changed
- Rejected getUserMedia calls, that don't fail due to denied permissions, will be retried one more time with fallback constraints, omitting width and height.

## 0.1.3

### Changed
- Public: Bring back height and width video constraints.

## 0.1.2

### Added
- Public: Added video recording feature.

### Fixed
- Fixed unhandled constraints errors

## 0.1.1

### Changed
- Internal: Changed babel inline code to babel-runtime and made that an external dependency, this allows cost savings in size for babel runtime code.


## 0.1.0

### Changed
- Replaced React with preact compat, which means it's not compatible with
React anymore until they support declarative html attributes and properties

### Added
- Flow typing added
- Added automatic mirroring for webcam facing the user and cameras
that don't have info on where they are facing (mostly desktop ones)
- Added support iOS
- Added support for picking user/env facing

### Removed
- Prop types have been removed


## 0.0.20

### Changed
- height and width props now only apply to the getUserMedia constraints i.e. camera resolution. Setting the size of the video element should be done through CSS.

### Fixed
- Support Safari 11. Use video.srcObject rather than video.src

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
