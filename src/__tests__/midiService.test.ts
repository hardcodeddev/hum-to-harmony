import midiService from '../services/midiService';

describe('midiService', () => {
  it('creates a midi header', () => {
    const bytes = midiService.createMidiBuffer(
      [{ midi: 60, durationBeats: 1 }],
      [],
      { tempo: 120, key: 'C', voices: 3 }
    );

    const header = String.fromCharCode(...bytes.slice(0, 4));
    expect(header).toBe('MThd');
  });
});
