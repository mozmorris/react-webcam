const MediaRecorder = window.MediaRecorder;

const handleDataAvailable = (event, recordedBlobs) => {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
};

const handleStop = (event) => {
  console.log('Recorder stopped: ', event);
};

const videoOptions = () => {
  let mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8,opus', 'video/webm'];
  let mimeType = '';
  for (let type in mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeTypes[type])) {
      mimeType = mimeTypes[type];
      break;
    }
    else {
      console.log(`${mimeTypes[type]} is not Supported`);
    }
  }
  return mimeType ? {mimeType} : {mimeType: ''};
};

export const createMediaRecorder = (stream) => {
  let options = videoOptions();
  try {
    return new MediaRecorder(stream, options);
  }
  catch (e) {
    console.error(`Exception while creating MediaRecorder: ${e}`);
    return;
  }
};

export const startRecording = (mediaRecorder) => {
  let recordedBlobs = [];
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = (e) => handleDataAvailable(e, recordedBlobs);
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
  return recordedBlobs;
};
