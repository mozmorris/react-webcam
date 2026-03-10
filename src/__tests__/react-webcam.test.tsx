import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { render, act } from '@testing-library/react';
import Webcam from '../react-webcam';

// ---------------------------------------------------------------------------
// Shared mock infrastructure
// ---------------------------------------------------------------------------

function makeMockTrack(): MediaStreamTrack {
  return { stop: vi.fn(), removeTrack: vi.fn() } as unknown as MediaStreamTrack;
}

function makeMockStream(videoTracks = 1, audioTracks = 0): MediaStream {
  const vTracks = Array.from({ length: videoTracks }, makeMockTrack);
  const aTracks = Array.from({ length: audioTracks }, makeMockTrack);
  return {
    getVideoTracks: vi.fn(() => vTracks),
    getAudioTracks: vi.fn(() => aTracks),
    removeTrack: vi.fn(),
  } as unknown as MediaStream;
}

function setVideoDimensions(
  el: HTMLVideoElement | null,
  dims: { videoWidth?: number; videoHeight?: number; clientWidth?: number; clientHeight?: number }
) {
  if (!el) return;
  const { videoWidth = 640, videoHeight = 480, clientWidth = 320, clientHeight = 240 } = dims;
  Object.defineProperty(el, 'videoWidth', { value: videoWidth, configurable: true, writable: true });
  Object.defineProperty(el, 'videoHeight', { value: videoHeight, configurable: true, writable: true });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true, writable: true });
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true, writable: true });
}

let mockStream: MediaStream;

beforeEach(() => {
  mockStream = makeMockStream(1, 0);
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
    configurable: true,
    writable: true,
  });
});

// ---------------------------------------------------------------------------
// Canvas mock
// ---------------------------------------------------------------------------

const mockDrawImage = vi.fn();
const mockTranslate = vi.fn();
const mockScale = vi.fn();
const mockToDataURL = vi.fn(() => 'data:image/webp;base64,MOCK');

beforeEach(() => {
  const mockCtx = {
    drawImage: mockDrawImage,
    translate: mockTranslate,
    scale: mockScale,
    imageSmoothingEnabled: true,
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(mockToDataURL);
});

// ---------------------------------------------------------------------------
// Original 3 tests (kept)
// ---------------------------------------------------------------------------

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Webcam
        audio={false}
        audioConstraints={{ sampleSize: 8, echoCancellation: true }}
        className="react-webcam"
        imageSmoothing={false}
        minScreenshotHeight={1000}
        minScreenshotWidth={1000}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotFormat="image/png"
        screenshotQuality={1}
        style={{ transform: 'rotate(180deg)' }}
        videoConstraints={{ width: 160, height: 120, frameRate: 15 }}
        height={1000}
        width={1000}
      />
    );

  expect(tree.toJSON()).toMatchSnapshot();
});

it('sets <video/> muted to false when props.audio is true', () => {
  const tree = renderer
    .create(
      <Webcam
        audio={true}
        audioConstraints={{ sampleSize: 8, echoCancellation: true }}
        className="react-webcam"
        imageSmoothing={false}
        minScreenshotHeight={1000}
        minScreenshotWidth={1000}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotFormat="image/png"
        screenshotQuality={1}
        style={{ transform: 'rotate(180deg)' }}
        videoConstraints={{ width: 160, height: 120, frameRate: 15 }}
        height={1000}
        width={1000}
      />
    );

  expect(tree.root.findByType('video').props.muted).toBe(false);
});

it('sets <video/> disablePictureInPicture to true when props.disablePictureInPicture is true', () => {
  const tree = renderer
    .create(
      <Webcam
        audio={false}
        audioConstraints={{ sampleSize: 8, echoCancellation: true }}
        className="react-webcam"
        disablePictureInPicture={true}
        imageSmoothing={false}
        minScreenshotHeight={1000}
        minScreenshotWidth={1000}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotFormat="image/png"
        screenshotQuality={1}
        style={{ transform: 'rotate(180deg)' }}
        videoConstraints={{ width: 160, height: 120, frameRate: 15 }}
        height={1000}
        width={1000}
      />
    );

  expect(tree.root.findByType('video').props.disablePictureInPicture).toBe(true);
});

// ---------------------------------------------------------------------------
// 2. Mount / getUserMedia call
// ---------------------------------------------------------------------------

describe('Mount / getUserMedia', () => {
  it('calls getUserMedia on mount', async () => {
    await act(async () => {
      render(<Webcam />);
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('calls onUserMedia callback with the stream', async () => {
    const onUserMedia = vi.fn();
    await act(async () => {
      render(<Webcam onUserMedia={onUserMedia} />);
    });
    expect(onUserMedia).toHaveBeenCalledWith(mockStream);
  });

  it('calls onUserMediaError when getUserMedia rejects', async () => {
    const error = new Error('Permission denied');
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    const onUserMediaError = vi.fn();
    await act(async () => {
      render(<Webcam onUserMediaError={onUserMediaError} />);
    });
    expect(onUserMediaError).toHaveBeenCalledWith(error);
  });

  it('calls onUserMediaError with "getUserMedia not supported" when mediaDevices is absent', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const onUserMediaError = vi.fn();
    await act(async () => {
      render(<Webcam onUserMediaError={onUserMediaError} />);
    });
    expect(onUserMediaError).toHaveBeenCalledWith('getUserMedia not supported');
  });

  it('attaches stream to video.srcObject on success', async () => {
    let webcamRef: React.RefObject<Webcam>;
    webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    expect(webcamRef.current?.video?.srcObject).toBe(mockStream);
  });

  it('sets hasUserMedia state to true on success', async () => {
    let webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    expect(webcamRef.current?.state.hasUserMedia).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Constraints passed to getUserMedia
// ---------------------------------------------------------------------------

describe('Constraints', () => {
  it('passes videoConstraints to getUserMedia', async () => {
    const videoConstraints = { width: 1280, height: 720 };
    await act(async () => {
      render(<Webcam videoConstraints={videoConstraints} />);
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ video: videoConstraints })
    );
  });

  it('passes audioConstraints when audio=true', async () => {
    const audioConstraints = { echoCancellation: true };
    await act(async () => {
      render(<Webcam audio={true} audioConstraints={audioConstraints} />);
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: audioConstraints })
    );
  });

  it('does not pass audio constraint when audio=false', async () => {
    await act(async () => {
      render(<Webcam audio={false} />);
    });
    const callArg = (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).not.toHaveProperty('audio');
  });
});

// ---------------------------------------------------------------------------
// 4. componentDidUpdate — constraint changes
// ---------------------------------------------------------------------------

describe('componentDidUpdate — constraint changes', () => {
  it('reinitialises stream when videoConstraints change', async () => {
    let rerender: ReturnType<typeof render>['rerender'];
    await act(async () => {
      ({ rerender } = render(<Webcam videoConstraints={{ width: 640 }} />));
    });
    await act(async () => {
      rerender(<Webcam videoConstraints={{ width: 1280 }} />);
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('reinitialises stream when audioConstraints change', async () => {
    let rerender: ReturnType<typeof render>['rerender'];
    await act(async () => {
      ({ rerender } = render(<Webcam audio={true} audioConstraints={{ echoCancellation: false }} />));
    });
    await act(async () => {
      rerender(<Webcam audio={true} audioConstraints={{ echoCancellation: true }} />);
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('stops old stream before requesting new one when videoConstraints change', async () => {
    const firstStream = makeMockStream(1, 0);
    const secondStream = makeMockStream(1, 0);
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockResolvedValueOnce(firstStream).mockResolvedValueOnce(secondStream);

    let rerender: ReturnType<typeof render>['rerender'];
    await act(async () => {
      ({ rerender } = render(<Webcam videoConstraints={{ width: 640 }} />));
    });
    await act(async () => {
      rerender(<Webcam videoConstraints={{ width: 1280 }} />);
    });

    const videoTracks = firstStream.getVideoTracks() as unknown as Array<{ stop: ReturnType<typeof vi.fn> }>;
    expect(videoTracks[0].stop).toHaveBeenCalled();
  });

  it('calls onUserMediaError in componentDidUpdate when getUserMedia becomes unavailable', async () => {
    const onUserMediaError = vi.fn();
    let rerender: ReturnType<typeof render>['rerender'];
    await act(async () => {
      ({ rerender } = render(<Webcam onUserMediaError={onUserMediaError} />));
    });

    // Remove mediaDevices after mount so hasGetUserMedia() returns false on update
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await act(async () => {
      rerender(<Webcam onUserMediaError={onUserMediaError} videoConstraints={{ width: 1280 }} />);
    });

    expect(onUserMediaError).toHaveBeenCalledWith('getUserMedia not supported');
  });

  it('does not reinitialise when only unrelated props change', async () => {
    let rerender: ReturnType<typeof render>['rerender'];
    await act(async () => {
      ({ rerender } = render(<Webcam className="a" />));
    });
    await act(async () => {
      rerender(<Webcam className="b" />);
    });
    // getUserMedia should only be called once (on mount)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 5. componentWillUnmount — cleanup
// ---------------------------------------------------------------------------

describe('componentWillUnmount — cleanup', () => {
  it('stops video tracks on unmount', async () => {
    const { unmount } = render(<Webcam />);
    await act(async () => { /* flush mount */ });

    // Wait for the stream to be set
    await act(async () => {});

    unmount();

    const vTracks = mockStream.getVideoTracks() as unknown as Array<{ stop: ReturnType<typeof vi.fn> }>;
    expect(vTracks[0].stop).toHaveBeenCalled();
  });

  it('stops audio tracks on unmount', async () => {
    mockStream = makeMockStream(1, 1);
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);

    const { unmount } = render(<Webcam audio={true} />);
    await act(async () => {});

    unmount();

    const aTracks = mockStream.getAudioTracks() as unknown as Array<{ stop: ReturnType<typeof vi.fn> }>;
    expect(aTracks[0].stop).toHaveBeenCalled();
  });

  it('does not call onUserMedia after unmount', async () => {
    const onUserMedia = vi.fn();
    let resolveStream!: (s: MediaStream) => void;
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(res => { resolveStream = res; })
    );

    const { unmount } = render(<Webcam onUserMedia={onUserMedia} />);
    unmount();

    await act(async () => {
      resolveStream(makeMockStream());
    });

    expect(onUserMedia).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 6. getScreenshot()
// ---------------------------------------------------------------------------

describe('getScreenshot()', () => {
  it('returns null when hasUserMedia is false', () => {
    const webcamRef = React.createRef<Webcam>();
    render(<Webcam ref={webcamRef} />);
    // Don't wait for getUserMedia — state stays false
    expect(webcamRef.current?.getScreenshot()).toBeNull();
  });

  it('returns null when video has no dimensions', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    // videoHeight defaults to 0 in jsdom — getCanvas returns null
    expect(webcamRef.current?.getScreenshot()).toBeNull();
  });

  it('returns a data URL when stream is active and video has dimensions', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });

    const result = webcamRef.current?.getScreenshot();
    expect(result).toBe('data:image/webp;base64,MOCK');
  });

  it('passes screenshotFormat and screenshotQuality to toDataURL', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} screenshotFormat="image/png" screenshotQuality={0.5} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });

    webcamRef.current?.getScreenshot();
    expect(mockToDataURL).toHaveBeenCalledWith('image/png', 0.5);
  });

  it('accepts optional screenshotDimensions override', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });

    webcamRef.current?.getScreenshot({ width: 100, height: 75 });
    expect(mockDrawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 100, 75);
  });
});

// ---------------------------------------------------------------------------
// 7. getCanvas() — sizing logic
// ---------------------------------------------------------------------------

describe('getCanvas() — sizing logic', () => {
  async function mountWithDims(
    props: Partial<React.ComponentProps<typeof Webcam>>,
    dims: Parameters<typeof setVideoDimensions>[1]
  ) {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} {...props} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, dims);
    return webcamRef.current!;
  }

  it('uses clientWidth as default canvas width', async () => {
    const wc = await mountWithDims({}, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });
    const canvas = wc.getCanvas();
    expect(canvas?.width).toBe(320);
  });

  it('respects minScreenshotWidth', async () => {
    const wc = await mountWithDims(
      { minScreenshotWidth: 800 },
      { videoWidth: 640, videoHeight: 480, clientWidth: 320 }
    );
    const canvas = wc.getCanvas();
    expect(canvas?.width).toBe(800);
  });

  it('respects minScreenshotHeight (scales up both dimensions)', async () => {
    // clientWidth=320, aspect=4/3 → default height=240. minHeight=600 → scale up.
    const wc = await mountWithDims(
      { minScreenshotHeight: 600 },
      { videoWidth: 640, videoHeight: 480, clientWidth: 320 }
    );
    const canvas = wc.getCanvas();
    expect(canvas?.height).toBe(600);
    // width should scale to maintain aspect ratio: 600 * (4/3) = 800
    expect(canvas?.width).toBe(800);
  });

  it('uses native videoWidth/videoHeight when forceScreenshotSourceSize=true', async () => {
    const wc = await mountWithDims(
      { forceScreenshotSourceSize: true },
      { videoWidth: 640, videoHeight: 480, clientWidth: 320 }
    );
    const canvas = wc.getCanvas();
    expect(canvas?.width).toBe(640);
    expect(canvas?.height).toBe(480);
  });

  it('sets imageSmoothingEnabled from imageSmoothing prop', async () => {
    const wc = await mountWithDims(
      { imageSmoothing: false },
      { videoWidth: 640, videoHeight: 480, clientWidth: 320 }
    );
    wc.getCanvas();
    const mockCtx = (HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    expect(mockCtx?.imageSmoothingEnabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. Mirroring
// ---------------------------------------------------------------------------

describe('Mirroring', () => {
  it('mirrored=true adds scaleX(-1) transform to video element style', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} mirrored={true} />);
    });
    const videoEl = webcamRef.current?.video;
    expect(videoEl?.style.transform).toContain('scaleX(-1)');
  });

  it('mirrored=false does not apply scaleX(-1) transform', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} mirrored={false} />);
    });
    const videoEl = webcamRef.current?.video;
    expect(videoEl?.style.transform).not.toContain('scaleX(-1)');
  });

  it('mirrored=true applies translate+scale on canvas context', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} mirrored={true} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });

    webcamRef.current?.getCanvas();
    expect(mockTranslate).toHaveBeenCalled();
    expect(mockScale).toHaveBeenCalledWith(-1, 1);
  });

  it('mirrored=false does not call translate/scale on canvas context', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} mirrored={false} />);
    });
    setVideoDimensions(webcamRef.current?.video ?? null, { videoWidth: 640, videoHeight: 480, clientWidth: 320 });

    webcamRef.current?.getCanvas();
    expect(mockTranslate).not.toHaveBeenCalled();
    expect(mockScale).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 9. Render props (children)
// ---------------------------------------------------------------------------

describe('Render props (children)', () => {
  it('renders return value of children function', async () => {
    const childFn = (() => <div>child content</div>) as any;
    const { getByText } = render(<Webcam children={childFn} />);
    expect(getByText('child content')).toBeTruthy();
  });

  it('passes getScreenshot to children function', async () => {
    const childFn = vi.fn(() => <div />) as any;
    render(<Webcam children={childFn} />);
    expect(childFn).toHaveBeenCalledWith(
      expect.objectContaining({ getScreenshot: expect.any(Function) })
    );
  });

  it('throws when children is not a function (render crashes before componentDidMount warning)', () => {
    // Suppress React's internal error logging for this expected throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        // @ts-expect-error intentionally passing invalid children
        <Webcam>{'not a function'}</Webcam>
      )
    ).toThrow('children is not a function');
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Additional coverage: edge cases
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('getCanvas returns null when this.video is null', async () => {
    const webcamRef = React.createRef<Webcam>();
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });
    // Manually nullify the video ref to exercise the early-return guard
    (webcamRef.current as any).video = null;
    expect(webcamRef.current?.getCanvas()).toBeNull();
  });

  it('falls back to URL.createObjectURL when srcObject assignment throws (legacy browser path)', async () => {
    const fakeUrl = 'blob:http://localhost/fake-url';
    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(fakeUrl);

    const webcamRef = React.createRef<Webcam>();

    // Render first so video element exists
    await act(async () => {
      render(<Webcam ref={webcamRef} />);
    });

    // Now make srcObject setter throw to trigger the catch path
    if (webcamRef.current?.video) {
      Object.defineProperty(webcamRef.current.video, 'srcObject', {
        set() { throw new Error('srcObject not supported'); },
        configurable: true,
      });
    }

    // Manually trigger handleUserMedia with a stream via the private method
    await act(async () => {
      (webcamRef.current as any).handleUserMedia(null, makeMockStream());
    });

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(webcamRef.current?.state.src).toBe(fakeUrl);
    createObjectURLSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// 10. stopAndCleanup / stopMediaStream (static)
// ---------------------------------------------------------------------------

describe('stopAndCleanup / stopMediaStream', () => {
  it('calls stop() and removeTrack() on each video and audio track', async () => {
    const stream = makeMockStream(1, 1);
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockResolvedValue(stream);

    const { unmount } = render(<Webcam audio={true} />);
    await act(async () => {});
    unmount();

    const vTracks = stream.getVideoTracks() as unknown as Array<{ stop: ReturnType<typeof vi.fn>; removeTrack: ReturnType<typeof vi.fn> }>;
    const aTracks = stream.getAudioTracks() as unknown as Array<{ stop: ReturnType<typeof vi.fn>; removeTrack: ReturnType<typeof vi.fn> }>;
    expect(vTracks[0].stop).toHaveBeenCalled();
    expect(aTracks[0].stop).toHaveBeenCalled();
  });

  it('falls back to calling .stop() on stream directly when getVideoTracks/getAudioTracks absent', () => {
    const stream = { stop: vi.fn() } as unknown as MediaStream;
    // Access private static via bracket notation
    (Webcam as any).stopMediaStream(stream);
    expect((stream as any).stop).toHaveBeenCalled();
  });
});
