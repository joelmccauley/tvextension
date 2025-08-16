import React, { useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, Grid, InputLabel, SelectChangeEvent } from '@mui/material';

// key AIzaSyAHZPRbQlDZOzkNKAjYb2vCk5f7i--eLi8

interface AudioOutputDevice {
  deviceId: string;
  label: string;
}

interface AudioInputDevice {
  deviceId: string;
  label: string;
}

const VoiceAssistant: React.FC = () => {
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [audioOutputDevices, setAudioOutputDevices] = useState<AudioOutputDevice[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<AudioInputDevice[]>([]);

  // Function to populate the dropdown with audio output devices
  useEffect(() => {
    async function getAudioDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = devices;
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        setAudioOutputDevices(audioOutputDevices.map(device => ({ deviceId: device.deviceId, label: device.label || `Audio Output Device` })));
        setAudioInputDevices(audioInputDevices.map(device => ({ deviceId: device.deviceId, label: device.label || `Audio Input Device` })));
      } catch (error) {
        console.error('Error getting audio devices:', error);
      }
    }

    getAudioDevices();
  }, []);

  // Handle selection change
  const handleOutputDeviceChange = (event: SelectChangeEvent<string>) => {
    const selectedDeviceId = event.target.value as string;
    setSelectedOutputDevice(selectedDeviceId);
    console.log('Selected Device ID:', selectedDeviceId);
  };

  // Handle selection change
  const handleInputDeviceChange = (event: SelectChangeEvent<string>) => {
    const selectedDeviceId = event.target.value as string;
    setSelectedInputDevice(selectedDeviceId);
    console.log('Selected Device ID:', selectedDeviceId);
  };

  const processAudioData = (audioData: Float32Array) => {
    // Send audio data to a speech-to-text service and process the results
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="audio-device-select-label">Listen Device</InputLabel>
          <Select
            labelId="audio-device-select-label"
            value={selectedOutputDevice}
            onChange={handleOutputDeviceChange}
            label="Audio Output Device"
          >
            {audioOutputDevices.map(device => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="audio-device-select-label">Output Device</InputLabel>
          <Select
            labelId="audio-device-select-label"
            value={selectedInputDevice}
            onChange={handleInputDeviceChange}
            label="Audio Output Device"
          >
            {audioInputDevices.map(device => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default VoiceAssistant;