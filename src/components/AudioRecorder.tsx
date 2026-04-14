import React from 'react';

interface AudioRecorderProps {
  isRecording: boolean;
  level: number;
  waveform: number[];
  onStart: () => void;
  onStop: () => void;
  error?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ isRecording, level, waveform, onStart, onStop, error }) => {
  return (
    <section className="panel" aria-label="Audio recorder">
      <h2>Recorder</h2>
      <button onClick={isRecording ? onStop : onStart}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>Level: {(level * 100).toFixed(0)}%</p>
      <div className="meter" aria-hidden>
        <div className="meter-fill" style={{ width: `${Math.min(100, level * 100)}%` }} />
      </div>
      <div className="waveform" aria-label="Waveform preview">
        {waveform.slice(0, 40).map((sample, i) => (
          <span key={i} style={{ height: `${Math.max(2, Math.abs(sample) * 40)}px` }} />
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
};

export default AudioRecorder;
