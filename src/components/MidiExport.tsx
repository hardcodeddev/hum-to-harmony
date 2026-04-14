import React, { useState } from 'react';
import midiService from '../services/midiService';
import { DetectedNote, MidiExportSettings } from '../types/audio';

interface MidiExportProps {
  notes: DetectedNote[];
  settings: MidiExportSettings;
}

const MidiExport: React.FC<MidiExportProps> = ({ notes, settings }) => {
  const [status, setStatus] = useState('');

  const handleExport = () => {
    if (!notes.length) {
      setStatus('No notes recorded yet.');
      return;
    }

    try {
      const midiData = midiService.fromDetectedNotes(notes, settings);
      midiService.exportToFile('hum-to-harmony.mid', midiData);
      setStatus('MIDI exported successfully.');
    } catch (error) {
      setStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <section className="panel" aria-label="MIDI export">
      <h2>Export</h2>
      <p>Tempo: {settings.tempo} BPM | Key: {settings.key}</p>
      <button onClick={handleExport}>Export MIDI</button>
      {status && <p>{status}</p>}
    </section>
  );
};

export default MidiExport;
