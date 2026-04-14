export interface DetectedNote {
  midi: number;
  frequency: number;
  noteName: string;
  confidence: number;
  time: number;
  duration: number;
}

export interface AppSettings {
  key: string;
  tempo: number;
  voices: 2 | 3 | 4;
  sensitivity: number;
}

export interface HarmonyResult {
  root: number;
  notes: number[];
  chordType: 'major' | 'minor' | 'seventh';
}

export interface MidiExportSettings {
  tempo: number;
  key: string;
  voices: 2 | 3 | 4;
}
