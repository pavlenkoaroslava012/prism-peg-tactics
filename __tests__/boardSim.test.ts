import { ENTRY_LANE, LANES, ROWS } from '../src/constants/config';
import { simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

describe('board simulation', () => {
  it('enters at the funnel lane and produces one node per row plus the slot', () => {
    const layout = makeLayout(() => 1);
    const sim = simulate(layout, {});
    expect(sim.path[0]).toEqual({ row: -1, lane: ENTRY_LANE });
    expect(sim.path[1]).toEqual({ row: 0, lane: ENTRY_LANE });
    expect(sim.path).toHaveLength(ROWS + 2);
    expect(sim.path[sim.path.length - 1].row).toBe(ROWS);
  });

  it('settles inside the board on every lane', () => {
    const layout = makeLayout((r, c) => ((r + c) % 2 === 0 ? 1 : -1));
    const sim = simulate(layout, {});
    expect(sim.landedLane).toBeGreaterThanOrEqual(0);
    expect(sim.landedLane).toBeLessThanOrEqual(LANES - 1);
    expect(sim.path[sim.path.length - 1].lane).toBe(sim.landedLane);
  });

  it('lights exactly one peg per row', () => {
    const layout = makeLayout(() => -1);
    expect(simulate(layout, {}).chargedPegs).toHaveLength(ROWS);
  });

  it('reports solved only when the landing lane matches the target', () => {
    const layout = makeLayout(() => 1);
    const sim = simulate(layout, {});
    const miss = { ...layout, targetLane: (sim.landedLane + 1) % LANES };
    expect(simulate(miss, {}).solved).toBe(false);
    const hit = { ...layout, targetLane: sim.landedLane };
    expect(simulate(hit, {}).solved).toBe(true);
  });
});
