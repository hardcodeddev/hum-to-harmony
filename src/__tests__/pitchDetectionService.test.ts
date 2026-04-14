import pitchDetectionService from '../services/pitchDetectionService';

const createSineBuffer = (frequency: number, sampleRate: number, size: number): Float32Array => {
  const buffer = new Float32Array(size);
  for (let i = 0; i < size; i += 1) {
    buffer[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return buffer;
};

describe('pitchDetectionService', () => {
  it('detects a stable pitch from a sine wave', () => {
    const result = pitchDetectionService.detectPitch(createSineBuffer(440, 44100, 2048), 44100);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A4');
    expect(result?.confidence).toBeGreaterThan(0.5);
  });

  it('returns null for silence', () => {
    const result = pitchDetectionService.detectPitch(new Float32Array(2048), 44100);
    expect(result).toBeNull();
  });
});
