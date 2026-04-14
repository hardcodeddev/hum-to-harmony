import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../components/App';

describe('App integration', () => {
  it('renders controls and allows settings changes', () => {
    render(<App />);

    expect(screen.getByText('Hum to Harmony')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Recording' })).toBeInTheDocument();

    const tempoInput = screen.getByLabelText('Tempo (BPM)') as HTMLInputElement;
    fireEvent.change(tempoInput, { target: { value: '140' } });

    expect(tempoInput.value).toBe('140');
  });
});
