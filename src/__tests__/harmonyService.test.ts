import harmonyService from '../services/harmonyService';

describe('harmonyService', () => {
  it('generates harmony with requested voice count', () => {
    const harmony = harmonyService.generateHarmony(60, 4, 'C');
    expect(harmony).toHaveLength(4);
    expect(harmony[0]).toBeLessThanOrEqual(harmony[1]);
  });

  it('adjusts potential parallel intervals when previous voices are provided', () => {
    const previous = [60, 67];
    const next = harmonyService.generateHarmony(62, 2, 'C', previous);
    expect(next).toHaveLength(2);
  });
});
