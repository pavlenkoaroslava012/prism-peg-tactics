import { ENTRY_LANE } from '../src/constants/config';
import { GATE_LEFT, GATE_PRISM, pegId, simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

describe('spectrum lock', () => {
  const tinted = makeLayout(
    () => 1,
    (row, col) => (row === 0 && col === ENTRY_LANE ? 'cyan' : null),
  );

  it('leaves the orb colourless without a PRISM gate on a tinted peg', () => {
    expect(simulate(tinted, {}).tint).toBeNull();
    expect(simulate(tinted, { [pegId(0, ENTRY_LANE)]: GATE_LEFT }).tint).toBeNull();
  });

  it('paints the orb when it passes a PRISM gate on a tinted peg', () => {
    expect(simulate(tinted, { [pegId(0, ENTRY_LANE)]: GATE_PRISM }).tint).toBe('cyan');
  });

  it('rejects the right lane with the wrong tint', () => {
    const landed = simulate(tinted, { [pegId(0, ENTRY_LANE)]: GATE_PRISM });
    const layout = { ...tinted, targetLane: landed.landedLane, requiredTint: 'magenta' as const };
    expect(simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_PRISM }).solved).toBe(false);
  });

  it('accepts the right lane with the required tint, so rotation matters', () => {
    const landed = simulate(tinted, { [pegId(0, ENTRY_LANE)]: GATE_PRISM });
    const layout = { ...tinted, targetLane: landed.landedLane, requiredTint: 'cyan' as const };
    expect(simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_PRISM }).solved).toBe(true);
    // Same placement, different rotation: the lane is reachable, the tint is not.
    expect(simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_LEFT }).solved).toBe(false);
  });
});
