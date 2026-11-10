import { ENTRY_LANE } from '../src/constants/config';
import {
  GATE_CYCLE,
  GATE_LEFT,
  GATE_PRISM,
  GATE_RIGHT,
  deflectionFor,
  pegId,
  simulate,
} from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

describe('prism gate placement and rotation', () => {
  it('cycles LEFT, RIGHT, PRISM and back', () => {
    expect(GATE_CYCLE).toEqual([GATE_LEFT, GATE_RIGHT, GATE_PRISM]);
    const next = (state: number) => GATE_CYCLE[(state + 1) % GATE_CYCLE.length];
    expect(next(GATE_LEFT)).toBe(GATE_RIGHT);
    expect(next(GATE_RIGHT)).toBe(GATE_PRISM);
    expect(next(GATE_PRISM)).toBe(GATE_LEFT);
  });

  it('overrides the peg bias with the gate state', () => {
    const peg = { row: 0, col: 0, bias: 1 as const, tint: null };
    expect(deflectionFor(peg, undefined)).toBe(1);
    expect(deflectionFor(peg, GATE_LEFT)).toBe(-1);
    expect(deflectionFor(peg, GATE_RIGHT)).toBe(1);
    expect(deflectionFor(peg, GATE_PRISM)).toBe(0);
  });

  it('changes the route when a gate is placed on the entry peg', () => {
    const layout = makeLayout(() => 1);
    const before = simulate(layout, {});
    const after = simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_LEFT });
    expect(after.path[2].lane).toBe(ENTRY_LANE - 1);
    expect(after.path).not.toEqual(before.path);
  });

  it('changes the landing slot on a board that does not funnel into a wall', () => {
    const layout = makeLayout(r => (r < 4 ? 1 : -1));
    const before = simulate(layout, {});
    const after = simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_LEFT });
    expect(after.landedLane).not.toBe(before.landedLane);
  });

  it('sends the orb straight down on a PRISM gate', () => {
    const layout = makeLayout(() => 1);
    const sim = simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_PRISM });
    expect(sim.path[2].lane).toBe(ENTRY_LANE);
  });
});
