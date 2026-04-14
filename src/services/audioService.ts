export interface AudioServiceState {
  isInitialized: boolean;
  sampleRate: number;
}

type FrameCallback = (timeDomain: Float32Array, frequencyDomain: Uint8Array, level: number) => void;

class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private rafId: number | null = null;

  async init(): Promise<AudioServiceState> {
    if (this.audioContext && this.analyser) {
      return { isInitialized: true, sampleRate: this.audioContext.sampleRate };
    }

    this.audioContext = new AudioContext();
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.microphoneSource = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.microphoneSource.connect(this.analyser);

    return { isInitialized: true, sampleRate: this.audioContext.sampleRate };
  }

  getTimeDomainData(): Float32Array {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(data);
    return data;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getAudioLevel(timeDomain: Float32Array): number {
    if (timeDomain.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < timeDomain.length; i += 1) {
      sum += timeDomain[i] * timeDomain[i];
    }
    return Math.min(1, Math.sqrt(sum / timeDomain.length));
  }

  startMonitoring(onFrame: FrameCallback): void {
    const tick = () => {
      const timeDomain = this.getTimeDomainData();
      const frequencyDomain = this.getFrequencyData();
      onFrame(timeDomain, frequencyDomain, this.getAudioLevel(timeDomain));
      this.rafId = requestAnimationFrame(tick);
    };

    if (this.rafId === null) {
      tick();
    }
  }

  stopMonitoring(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  async cleanup(): Promise<void> {
    this.stopMonitoring();

    if (this.microphoneSource) {
      this.microphoneSource.disconnect();
      this.microphoneSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  getSampleRate(): number {
    return this.audioContext?.sampleRate ?? 44100;
  }
}

export default new AudioService();
