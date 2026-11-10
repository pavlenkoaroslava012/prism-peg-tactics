import { GATE_LEFT, GATE_RIGHT, pegId, simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

describe('route prediction', () => {
  const layout = makeLayout((r, c) => ((r * 3 + c) % 2 === 0 ? 1 : -1));
  const gates = { [pegId(0, 4)]: GATE_LEFT, [pegId(2, 3)]: GATE_RIGHT };

  it('returns an identical path for the same board and gates', () => {
    const a = simulate(layout, gates);
    const b = simulate(layout, gates);
    expect(b.path).toEqual(a.path);
    expect(b.landedLane).toBe(a.landedLane);
    expect(b.tint).toBe(a.tint);
  });

  it('is stable across many repeats, so there is no RNG at drop time', () => {
    const first = simulate(layout, gates).path.map(n => n.lane).join(',');
    for (let i = 0; i < 50; i++) {
      expect(simulate(layout, gates).path.map(n => n.lane).join(',')).toBe(first);
    }
  });

  it('never mutates the layout or the gate map while simulating', () => {
    const snapshot = JSON.stringify({ layout, gates });
    simulate(layout, gates);
    expect(JSON.stringify({ layout, gates })).toBe(snapshot);
  });
});
