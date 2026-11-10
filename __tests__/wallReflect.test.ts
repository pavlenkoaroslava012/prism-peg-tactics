import { LANES, ROWS } from '../src/constants/config';
import { applyLane, simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

describe('wall reflection', () => {
  it('reflects inward at lane zero instead of clamping', () => {
    expect(applyLane(0, -1, LANES)).toEqual({ lane: 1, wall: true });
  });

  it('reflects inward at the last lane instead of clamping', () => {
    expect(applyLane(LANES - 1, 1, LANES)).toEqual({ lane: LANES - 2, wall: true });
  });

  it('leaves interior lanes untouched', () => {
    expect(applyLane(4, 1, LANES)).toEqual({ lane: 5, wall: false });
    expect(applyLane(4, -1, LANES)).toEqual({ lane: 3, wall: false });
    expect(applyLane(4, 0, LANES)).toEqual({ lane: 4, wall: false });
  });

  it('keeps the orb inside the board on an all-right board and marks the sparks', () => {
    const layout = makeLayout(() => 1);
    const sim = simulate(layout, {});
    sim.path.forEach(node => {
      expect(node.lane).toBeGreaterThanOrEqual(0);
      expect(node.lane).toBeLessThanOrEqual(LANES - 1);
    });
    expect(sim.wallSparkRows.length).toBeGreaterThan(0);
    sim.wallSparkRows.forEach(row => {
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(ROWS);
    });
  });

  it('reports no spark on a board that never reaches a wall', () => {
    const layout = makeLayout((r, c) => (c > 4 ? -1 : 1));
    expect(simulate(layout, {}).wallSparkRows).toEqual([]);
  });
});
