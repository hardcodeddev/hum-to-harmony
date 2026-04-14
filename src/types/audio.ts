// src/types/audio.ts

export interface DetectedNote {
    pitch: number;  // MIDI note number
    duration: number; // Duration in seconds
    time: number; // Time in seconds when the note was detected
}

export interface HarmonyVoices {
    voiceCount: number; // Number of harmony voices
    voices: string[]; // Array of voice names
}

export interface AudioConfig {
    sampleRate: number; // Sample rate in Hz
    bitRate: number; // Bit rate in kbps
    channels: number; // Number of audio channels (e.g., 1 for mono, 2 for stereo)
}

export interface MidiExportSettings {
    format: string; // MIDI format (e.g., "Standard MIDI File")
    tempo: number; // Tempo in beats per minute
    trackCount: number; // Number of tracks in the MIDI file
}