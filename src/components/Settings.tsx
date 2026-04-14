import React from 'react';
import { AppSettings } from '../types/audio';

interface SettingsProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
}

const KEY_OPTIONS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const Settings: React.FC<SettingsProps> = ({ settings, onChange }) => {
  return (
    <section className="panel" aria-label="Settings">
      <h2>Settings</h2>
      <label>
        Key
        <select
          value={settings.key}
          onChange={(event) => onChange({ ...settings, key: event.target.value })}
        >
          {KEY_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tempo (BPM)
        <input
          type="number"
          min={40}
          max={240}
          value={settings.tempo}
          onChange={(event) => onChange({ ...settings, tempo: Number(event.target.value) })}
        />
      </label>

      <label>
        Voices
        <select
          value={settings.voices}
          onChange={(event) => onChange({ ...settings, voices: Number(event.target.value) as 2 | 3 | 4 })}
        >
          {[2, 3, 4].map((voiceCount) => (
            <option key={voiceCount} value={voiceCount}>
              {voiceCount}
            </option>
          ))}
        </select>
      </label>

      <label>
        Sensitivity
        <input
          type="range"
          min={0.01}
          max={0.3}
          step={0.01}
          value={settings.sensitivity}
          onChange={(event) => onChange({ ...settings, sensitivity: Number(event.target.value) })}
        />
      </label>
    </section>
  );
};

export default Settings;
