const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_ALIASES: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#'
};

export const frequencyToMidiNote = (frequency: number): number => {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return 0;
  }
  return Math.round(69 + 12 * Math.log2(frequency / 440));
};

export const midiNoteToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export const midiNoteToNoteName = (midi: number): string => {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const note = NOTE_NAMES[clamped % 12];
  const octave = Math.floor(clamped / 12) - 1;
  return `${note}${octave}`;
};

export const noteNameToMidiNote = (noteName: string): number => {
  const match = noteName.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  const rawNote = `${match[1].toUpperCase()}${match[2] || ''}`;
  const note = FLAT_ALIASES[rawNote] || rawNote;
  const index = NOTE_NAMES.indexOf(note);
  if (index < 0) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  const octave = Number(match[3]);
  return (octave + 1) * 12 + index;
};

export const getChordNotes = (
  rootMidi: number,
  chordType: 'major' | 'minor' | 'seventh' = 'major'
): number[] => {
  const intervals =
    chordType === 'minor' ? [0, 3, 7] : chordType === 'seventh' ? [0, 4, 7, 10] : [0, 4, 7];
  return intervals.map((interval) => rootMidi + interval);
};
