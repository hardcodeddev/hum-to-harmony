import React from 'react';
import AudioRecorder from './AudioRecorder';
import PitchDisplay from './PitchDisplay';
import HarmonyPreview from './HarmonyPreview';
import MidiExport from './MidiExport';
import Settings from './Settings';

const App = () => {
    return (
        <div>
            <h1>Hum to Harmony</h1>
            <AudioRecorder />
            <PitchDisplay />
            <HarmonyPreview />
            <MidiExport />
            <Settings />
        </div>
    );
};

export default App;
