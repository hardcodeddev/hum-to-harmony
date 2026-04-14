import { frequencyToMidiNote, midiNoteToNoteName } from './noteUtils';

export interface PitchDetectionResult {
  frequency: number;
  midi: number;
  noteName: string;
  confidence: number;
}

class PitchDetectionService {
  private readonly smoothingWindow: number[] = [];
  private readonly maxSmoothingWindowSize = 5;

  private autocorrelate(buffer: Float32Array, sampleRate: number): { frequency: number; confidence: number } {
    const size = buffer.length;
    let rms = 0;
    for (let i = 0; i < size; i += 1) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / size);

    if (rms < 0.01) {
      return { frequency: 0, confidence: 0 };
    }

    const correlations = new Float32Array(size);
    for (let offset = 0; offset < size; offset += 1) {
      let sum = 0;
      for (let i = 0; i < size - offset; i += 1) {
        sum += buffer[i] * buffer[i + offset];
      }
      correlations[offset] = sum;
    }

    let offset = 1;
    while (offset < size - 1 && correlations[offset] > correlations[offset + 1]) {
      offset += 1;
    }

    let bestOffset = -1;
    let bestCorrelation = -Infinity;
    for (let i = offset; i < size - 1; i += 1) {
      if (correlations[i] > bestCorrelation) {
        bestCorrelation = correlations[i];
        bestOffset = i;
      }
    }

    if (bestOffset <= 0 || !Number.isFinite(bestCorrelation)) {
      return { frequency: 0, confidence: 0 };
    }

    const prev = correlations[bestOffset - 1] ?? correlations[bestOffset];
    const next = correlations[bestOffset + 1] ?? correlations[bestOffset];
    const current = correlations[bestOffset];
    const denominator = 2 * (2 * current - prev - next);
    const shift = denominator !== 0 ? (next - prev) / denominator : 0;
    const refinedOffset = bestOffset + shift;

    return {
      frequency: sampleRate / refinedOffset,
      confidence: Math.min(1, Math.max(0, current / (correlations[0] || 1)))
    };
  }

  detectPitch(buffer: Float32Array, sampleRate: number): PitchDetectionResult | null {
    const { frequency, confidence } = this.autocorrelate(buffer, sampleRate);
    if (!frequency) {
      return null;
    }

    this.smoothingWindow.push(frequency);
    if (this.smoothingWindow.length > this.maxSmoothingWindowSize) {
      this.smoothingWindow.shift();
    }

    const smoothFrequency =
      this.smoothingWindow.reduce((sum, value) => sum + value, 0) / this.smoothingWindow.length;
    const midi = frequencyToMidiNote(smoothFrequency);

    return {
      frequency: smoothFrequency,
      midi,
      noteName: midiNoteToNoteName(midi),
      confidence: Math.min(1, Math.max(0, confidence))
    };
  }

  reset(): void {
    this.smoothingWindow.length = 0;
  }
}

export default new PitchDetectionService();
