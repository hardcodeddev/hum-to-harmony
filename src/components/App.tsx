import React, { useMemo, useRef, useState } from 'react';
import AudioRecorder from './AudioRecorder';
import PitchDisplay from './PitchDisplay';
import HarmonyPreview from './HarmonyPreview';
import MidiExport from './MidiExport';
import Settings from './Settings';
import audioService from '../services/audioService';
import pitchDetectionService from '../services/pitchDetectionService';
import { AppSettings, DetectedNote } from '../types/audio';
import '../App.css';

const defaultSettings: AppSettings = {
  key: 'C',
  tempo: 120,
  voices: 3,
  sensitivity: 0.05
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [currentNote, setCurrentNote] = useState<DetectedNote | null>(null);
  const [noteHistory, setNoteHistory] = useState<DetectedNote[]>([]);
  const [harmony, setHarmony] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  const lastDetectedRef = useRef<DetectedNote | null>(null);

  const startRecording = async () => {
    setError('');
    try {
      const state = await audioService.init();
      setIsRecording(state.isInitialized);

      audioService.startMonitoring((timeDomain, _frequencyDomain, nextLevel) => {
        setLevel(nextLevel);
        setWaveform(Array.from(timeDomain.slice(0, 64)));
        if (nextLevel < settings.sensitivity) return;

        const result = pitchDetectionService.detectPitch(timeDomain, audioService.getSampleRate());
        if (!result || result.confidence < 0.1) return;

        const now = performance.now() / 1000;
        const previous = lastDetectedRef.current;
        const duration = previous ? Math.max(0.05, now - previous.time) : 0.1;

        const detected: DetectedNote = {
          ...result,
          time: now,
          duration
        };

        lastDetectedRef.current = detected;
        setCurrentNote(detected);
        setNoteHistory((prev) => [...prev.slice(-63), detected]);
      });
    } catch (initError) {
      setError(initError instanceof Error ? initError.message : 'Unable to access microphone.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    audioService.stopMonitoring();
    await audioService.cleanup();
    setIsRecording(false);
  };

  const exportSettings = useMemo(
    () => ({ tempo: settings.tempo, key: settings.key, voices: settings.voices }),
    [settings]
  );

  return (
    <main className="app">
      <h1>Hum to Harmony</h1>
      <div className="grid">
        <AudioRecorder
          isRecording={isRecording}
          level={level}
          waveform={waveform}
          onStart={startRecording}
          onStop={stopRecording}
          error={error}
        />
        <PitchDisplay current={currentNote} history={noteHistory} />
        <HarmonyPreview
          currentNote={currentNote}
          settings={settings}
          previousHarmony={harmony}
          onHarmonyGenerated={setHarmony}
        />
        <MidiExport notes={noteHistory} settings={exportSettings} />
        <Settings settings={settings} onChange={setSettings} />
      </div>
    </main>
  );
};

export default App;
