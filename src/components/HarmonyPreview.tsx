import React, { useMemo } from 'react';
import harmonyService from '../services/harmonyService';
import { midiNoteToFrequency, midiNoteToNoteName } from '../services/noteUtils';
import { AppSettings, DetectedNote } from '../types/audio';

interface HarmonyPreviewProps {
  currentNote: DetectedNote | null;
  settings: AppSettings;
  previousHarmony: number[];
  onHarmonyGenerated: (voices: number[]) => void;
}

const HarmonyPreview: React.FC<HarmonyPreviewProps> = ({
  currentNote,
  settings,
  previousHarmony,
  onHarmonyGenerated
}) => {
  const harmony = useMemo(() => {
    if (!currentNote) return [];
    const generated = harmonyService.generateHarmony(
      currentNote.midi,
      settings.voices,
      settings.key,
      previousHarmony
    );
    onHarmonyGenerated(generated);
    return generated;
  }, [currentNote?.midi, settings.voices, settings.key]);

  const playPreview = () => {
    if (!currentNote || harmony.length === 0) return;

    const context = new AudioContext();
    [...harmony, currentNote.midi].forEach((midi, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = midiNoteToFrequency(midi);
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.02);
      oscillator.stop(context.currentTime + 0.6 + index * 0.02);
    });
  };

  return (
    <section className="panel" aria-label="Harmony preview">
      <h2>Harmony</h2>
      <p>Voices: {settings.voices}</p>
      <p>Chord: {harmony.length ? harmony.map(midiNoteToNoteName).join(' - ') : '—'}</p>
      <button onClick={playPreview} disabled={!harmony.length}>
        Play Preview
      </button>
    </section>
  );
};

export default HarmonyPreview;
