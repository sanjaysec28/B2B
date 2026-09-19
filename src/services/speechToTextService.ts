/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LiveTranscriptionCallbacks {
  onReady?: () => void;
  onInterimTranscript?: (text: string, languageCode?: string) => void;
  onFinalTranscript?: (text: string, languageCode?: string, isFinished?: boolean) => void;
  onAudioLevel?: (level: number) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * Resamples Float32 audio samples from source sample rate to 16000Hz mono.
 */
function downsampleTo16k(inputBuffer: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return inputBuffer;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(inputBuffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetInput = 0;

  while (offsetResult < result.length) {
    const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetInput; i < nextOffsetInput && i < inputBuffer.length; i++) {
      accum += inputBuffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : inputBuffer[offsetInput];
    offsetResult++;
    offsetInput = nextOffsetInput;
  }
  return result;
}

/**
 * Converts Float32 audio buffer (-1.0 to 1.0) to 16-bit Little-Endian PCM ArrayBuffer.
 */
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

/**
 * Encodes an ArrayBuffer into base64 string for WebSocket transport.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Real-time Speech-to-Text Service using Google Gemini Live Transcription (gemini-3.5-transcribe-live)
 * via WebSockets and raw 16-bit 16kHz Little-Endian PCM audio streaming.
 */
export class GeminiLiveTranscriptionService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private muteNode: GainNode | null = null;
  private callbacks: LiveTranscriptionCallbacks = {};
  private isConnected = false;
  private isConnecting = false;

  public get active(): boolean {
    return this.isConnected;
  }

  /**
   * Starts microphone stream, opens WebSocket connection to server Gemini Live bridge,
   * converts audio to 16-bit 16kHz mono PCM, and streams continuously in real time.
   */
  async start(callbacks: LiveTranscriptionCallbacks = {}): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.callbacks = callbacks;
    this.isConnecting = true;

    try {
      // 1. Request microphone permission
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      // 2. Open WebSocket connection to server Gemini Live bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-transcribe`;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          reject(new Error('WebSocket connection timed out.'));
        }, 10000);

        ws.onopen = () => {
          window.clearTimeout(timeout);
          this.isConnected = true;
          this.isConnecting = false;
          resolve();
        };

        ws.onerror = (err) => {
          window.clearTimeout(timeout);
          this.isConnecting = false;
          console.error('Gemini errors:', err);
          reject(new Error('Failed to connect to real-time transcription service.'));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ready') {
              console.log('Gemini connected');
              this.callbacks.onReady?.();
            } else if (data.type === 'interim') {
              if (data.text) {
                console.log('interim transcript received:', data.text);
                this.callbacks.onInterimTranscript?.(data.text, data.languageCode);
              }
            } else if (data.type === 'final') {
              if (data.text) {
                console.log('final transcript received:', data.text);
                this.callbacks.onFinalTranscript?.(data.text, data.languageCode, data.finished);
              }
            } else if (data.type === 'error') {
              console.error('Gemini errors:', data.message);
              const err = new Error(data.message || 'Gemini Live transcription error');
              this.callbacks.onError?.(err);
            } else if (data.type === 'closed') {
              this.callbacks.onClose?.();
            }
          } catch (e) {
            console.error('Error parsing WebSocket message from server:', e);
          }
        };

        ws.onclose = () => {
          window.clearTimeout(timeout);
          this.isConnected = false;
          this.isConnecting = false;
          this.callbacks.onClose?.();
        };
      });

      // 3. Audio Pipeline: Sample rate conversion & 16-bit PCM streaming
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      this.audioContext = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      console.log('microphone started');

      const sourceNode = audioContext.createMediaStreamSource(stream);
      this.sourceNode = sourceNode;

      // 4096 samples buffer size (~92ms buffer at 44.1kHz, ~85ms at 48kHz)
      const bufferSize = 4096;
      const processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
      this.processorNode = processorNode;

      processorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputChannelData = audioProcessingEvent.inputBuffer.getChannelData(0);

        // Verify non-zero audio data and calculate RMS
        let sum = 0;
        let hasNonZero = false;
        for (let i = 0; i < inputChannelData.length; i++) {
          const sample = inputChannelData[i];
          if (sample !== 0) {
            hasNonZero = true;
          }
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        const normalizedLevel = Math.min(1, Math.max(0, rms * 5));
        this.callbacks.onAudioLevel?.(normalizedLevel);

        // Downsample to 16kHz mono
        const downsampled16k = downsampleTo16k(inputChannelData, audioContext.sampleRate);

        // Convert to RAW 16-bit Little-Endian PCM
        const pcm16Buffer = floatTo16BitPCM(downsampled16k);
        console.log('PCM chunk size:', pcm16Buffer.byteLength, 'nonZero:', hasNonZero);

        // Send base64-encoded PCM chunk over WebSocket to server
        const base64Audio = arrayBufferToBase64(pcm16Buffer);
        this.ws.send(
          JSON.stringify({
            type: 'audio',
            data: base64Audio,
          })
        );
        console.log('audio chunk sent');
      };

      // Mute node prevents microphone from echoing into speakers while keeping audio graph active
      const muteNode = audioContext.createGain();
      muteNode.gain.value = 0;
      this.muteNode = muteNode;

      sourceNode.connect(processorNode);
      processorNode.connect(muteNode);
      muteNode.connect(audioContext.destination);
    } catch (err: any) {
      this.isConnecting = false;
      this.stop();
      throw err;
    }
  }

  /**
   * Gracefully stops recording, shuts down audio nodes and closes the WebSocket bridge.
   */
  stop(): void {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'stop' }));
        this.ws.close();
      } catch (e) {
        console.warn('Error closing websocket:', e);
      }
    }
    this.ws = null;

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch (e) {}
      this.processorNode = null;
    }

    if (this.muteNode) {
      try {
        this.muteNode.disconnect();
      } catch (e) {}
      this.muteNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {}
      this.sourceNode = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.callbacks = {};
  }
}

export const speechToTextService = new GeminiLiveTranscriptionService();
export const geminiLiveTranscription = speechToTextService;
