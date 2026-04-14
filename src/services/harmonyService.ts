import { getChordNotes } from './noteUtils';

const normalizeToRange = (midi: number, min = 40, max = 88): number => {
  let value = midi;
  while (value < min) value += 12;
  while (value > max) value -= 12;
  return value;
};

const intervalClass = (a: number, b: number): number => Math.abs((a - b) % 12);

class HarmonyService {
  private getChordType(rootMidi: number, key: string): 'major' | 'minor' | 'seventh' {
    const keyMap: Record<string, number> = {
      C: 0,
      'C#': 1,
      D: 2,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      G: 7,
      Ab: 8,
      A: 9,
      Bb: 10,
      B: 11
    };

    const scaleDegree = ((rootMidi % 12) - (keyMap[key] ?? 0) + 12) % 12;
    if ([2, 4, 9].includes(scaleDegree)) return 'minor';
    if ([7, 11].includes(scaleDegree)) return 'seventh';
    return 'major';
  }

  generateHarmony(
    rootMidi: number,
    voiceCount: 2 | 3 | 4,
    key: string,
    previous?: number[]
  ): number[] {
    const chordType = this.getChordType(rootMidi, key);
    const chord = getChordNotes(rootMidi, chordType);

    const voices: number[] = [normalizeToRange(rootMidi)];
    for (let i = 1; i < voiceCount; i += 1) {
      const chordTone = chord[i % chord.length] + (i > 2 ? 12 : 0);
      voices.push(normalizeToRange(chordTone));
    }

    voices.sort((a, b) => a - b);

    if (previous && previous.length === voices.length) {
      for (let i = 1; i < voices.length; i += 1) {
        const prevInterval = intervalClass(previous[i], previous[i - 1]);
        const currInterval = intervalClass(voices[i], voices[i - 1]);
        const motionA = Math.sign(voices[i] - previous[i]);
        const motionB = Math.sign(voices[i - 1] - previous[i - 1]);

        if ((currInterval === 7 || currInterval === 0) && currInterval === prevInterval && motionA === motionB) {
          voices[i] = normalizeToRange(voices[i] + 1);
        }
      }
      voices.sort((a, b) => a - b);
    }

    return voices;
  }
}

export default new HarmonyService();
