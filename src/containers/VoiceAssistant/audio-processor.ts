// audio-processor.ts
export const loadAudioProcessorWorklet = async (audioContext: AudioContext) => {
  const blob = new Blob(
    [
      `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.buffer = [];
        this.bufferSize = 4096;
      }

      process(inputs, outputs) {
        const input = inputs[0];
        const channelData = input[0];

        this.buffer.push(...channelData);

        if (this.buffer.length >= this.bufferSize) {
          const audioData = new Float32Array(this.buffer.slice(0, this.bufferSize));
          this.port.postMessage(audioData);
          this.buffer = this.buffer.slice(this.bufferSize);
        }

        return true;
      }
    }

    registerProcessor("audio-processor", AudioProcessor);
  `,
    ],
    { type: "application/javascript" }
  );
  const workletURL = URL.createObjectURL(blob);
  await audioContext.audioWorklet.addModule(workletURL);
  URL.revokeObjectURL(workletURL);
};