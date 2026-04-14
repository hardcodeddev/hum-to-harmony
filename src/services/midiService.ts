import { MidiExportSettings, DetectedNote } from '../types/audio';

const Midi = require('jsmidgen');

export interface MidiNoteEvent {
  midi: number;
  durationBeats: number;
}

class MidiService {
  createMidiBuffer(
    leadNotes: MidiNoteEvent[],
    harmonyVoices: MidiNoteEvent[][],
    settings: MidiExportSettings
  ): Uint8Array {
    const file = new Midi.File();
    const leadTrack = new Midi.Track();
    leadTrack.setTempo(settings.tempo);
    file.addTrack(leadTrack);

    for (const note of leadNotes) {
      leadTrack.addNote(0, note.midi, Math.max(1, Math.round(note.durationBeats * 128)));
    }

    harmonyVoices.forEach((voice, voiceIndex) => {
      const track = new Midi.Track();
      track.setTempo(settings.tempo);
      file.addTrack(track);
      voice.forEach((note) => {
        track.addNote(Math.min(15, voiceIndex + 1), note.midi, Math.max(1, Math.round(note.durationBeats * 128)));
      });
    });

    const bytes = file.toBytes();
    return Uint8Array.from(bytes, (ch: string) => ch.charCodeAt(0));
  }

  fromDetectedNotes(notes: DetectedNote[], settings: MidiExportSettings): Uint8Array {
    const leadNotes: MidiNoteEvent[] = notes.map((note) => ({
      midi: note.midi,
      durationBeats: Math.max(0.25, note.duration * settings.tempo / 60)
    }));

    return this.createMidiBuffer(leadNotes, [], settings);
  }

  exportToFile(filename: string, data: Uint8Array): void {
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export default new MidiService();
