# Hum to Harmony

Electron + React + TypeScript app that captures microphone input, detects pitch, generates harmonies, and exports MIDI.

## Setup

```bash
npm install
npm run build
npm start
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Build Artifacts

- `dist/electron.js` - Electron main process bundle
- `dist/renderer.js` - Renderer bundle
- `dist/index.html` - Renderer HTML entry

## Services API

- `audioService.init(): Promise<{ isInitialized: boolean; sampleRate: number }>`
- `audioService.startMonitoring(onFrame)` / `audioService.stopMonitoring()` / `audioService.cleanup()`
- `pitchDetectionService.detectPitch(buffer, sampleRate)`
- `harmonyService.generateHarmony(rootMidi, voiceCount, key, previous?)`
- `midiService.createMidiBuffer(leadNotes, harmonyVoices, settings)`
- `midiService.fromDetectedNotes(notes, settings)`
- Note helpers in `src/services/noteUtils.ts`:
  - `frequencyToMidiNote`
  - `midiNoteToFrequency`
  - `midiNoteToNoteName`
  - `noteNameToMidiNote`
  - `getChordNotes`

## Components

- `AudioRecorder`: start/stop, level meter, waveform snapshot, mic errors
- `PitchDisplay`: current note/frequency/confidence, recent note history
- `HarmonyPreview`: voice-aware harmony preview + playback
- `MidiExport`: exports recorded notes to `.mid`
- `Settings`: key, tempo, voice count, sensitivity controls

## Manual Testing Checklist

- [ ] Microphone permission request works
- [ ] Real-time recording captures audio
- [ ] Pitch detection identifies hummed notes correctly
- [ ] Detected notes display in UI
- [ ] Harmony generation works
- [ ] MIDI export creates valid .mid file
- [ ] MIDI file plays in Ableton Live
- [ ] All UI controls are responsive
- [ ] Settings persist and apply correctly
- [ ] Error handling works (no microphone, etc.)
