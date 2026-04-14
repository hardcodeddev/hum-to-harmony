import {
  frequencyToMidiNote,
  midiNoteToFrequency,
  midiNoteToNoteName,
  noteNameToMidiNote,
  getChordNotes
} from '../services/noteUtils';

describe('noteUtils', () => {
  it('converts frequency to midi and back', () => {
    expect(frequencyToMidiNote(440)).toBe(69);
    expect(Math.round(midiNoteToFrequency(69))).toBe(440);
  });

  it('converts midi note to note name and back', () => {
    expect(midiNoteToNoteName(60)).toBe('C4');
    expect(noteNameToMidiNote('C4')).toBe(60);
    expect(noteNameToMidiNote('Bb3')).toBe(58);
  });

  it('builds chord notes', () => {
    expect(getChordNotes(60, 'major')).toEqual([60, 64, 67]);
    expect(getChordNotes(60, 'minor')).toEqual([60, 63, 67]);
    expect(getChordNotes(60, 'seventh')).toEqual([60, 64, 67, 70]);
  });
});
