interface Navigator {
  webkitGetUserMedia: () => void;
  mozGetUserMedia: () => void;
  msGetUserMedia: () => void;
}

interface MediaStreamTrack {
  getSources: () => void;
}
