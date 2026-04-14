import React from 'react';
import { DetectedNote } from '../types/audio';

interface PitchDisplayProps {
  current: DetectedNote | null;
  history: DetectedNote[];
}

const PitchDisplay: React.FC<PitchDisplayProps> = ({ current, history }) => {
  return (
    <section className="panel" aria-label="Pitch display">
      <h2>Pitch</h2>
      <p>Note: {current?.noteName ?? '—'}</p>
      <p>Frequency: {current ? `${current.frequency.toFixed(2)} Hz` : '—'}</p>
      <p>Confidence: {current ? `${(current.confidence * 100).toFixed(0)}%` : '—'}</p>
      <h3>History</h3>
      <ul>
        {history.slice(-8).reverse().map((note, index) => (
          <li key={`${note.time}-${index}`}>{note.noteName} ({note.frequency.toFixed(1)}Hz)</li>
        ))}
      </ul>
    </section>
  );
};

export default PitchDisplay;
