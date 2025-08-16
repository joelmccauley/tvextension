// components/Transcription.tsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

interface Props {
  deviceId: string;
}

const Transcription: React.FC<Props> = ({ deviceId }) => {
  const [transcription, setTranscription] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const transcribeAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await axios.post('https://api.assemblyai.com/v2/transcript', formData, {
        headers: {
          'authorization': 'YOUR_ASSEMBLYAI_API_KEY',
          'content-type': 'multipart/form-data',
        },
      });
      const transcript = response.data.text;
      setTranscription(transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const audioConstraints: MediaStreamConstraints = {
        audio: {
          deviceId: { exact: deviceId },
        },
      };
      const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      mediaRecorder.current = new MediaRecorder(audioStream);
      mediaRecorder.current.addEventListener('dataavailable', (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      });
      mediaRecorder.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        audioChunks.current = [];
        transcribeAudio(audioBlob);
      });

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button onClick={handleStartRecording}>Start Recording</button>
      <button onClick={handleStopRecording}>Stop Recording</button>
      <p>Transcription: {transcription}</p>
    </div>
  );
};

export default Transcription;