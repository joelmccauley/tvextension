document.addEventListener('DOMContentLoaded', function() {
  const requestPermissionBtn = document.getElementById('requestPermission');
  const audioDeviceList = document.getElementById('audioDeviceList');

  requestPermissionBtn.addEventListener('click', getAudioDevices);

  // Function to populate the dropdown with audio output devices
  async function getAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices;
      audioDevices.forEach(device => {
        console.log(device);
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.innerText = device.label || `Audio Output Device ${audioDeviceList.options.length + 1}`;
        audioDeviceList.appendChild(option);
      });
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  }
});