import { LANES, ROWS, TOTAL_ROUTES } from '../src/constants/config';
import { simulate } from '../src/game/boardSim';
import {
  buildFallback,
  generateLayout,
  isSolvableWithoutGates,
  minimalSolution,
  routeDescriptor,
} from '../src/game/levelGen';

describe('seeded, solvability-checked generation', () => {
  it('builds a complete peg matrix for every route', () => {
    const layout = generateLayout(0);
    expect(layout.pegs).toHaveLength(ROWS * LANES);
    expect(layout.rows).toBe(ROWS);
    expect(layout.lanes).toBe(LANES);
    expect(layout.targetLane).toBeGreaterThanOrEqual(0);
    expect(layout.targetLane).toBeLessThan(LANES);
  });

  it('is reproducible from its seed', () => {
    const a = generateLayout(5);
    const b = generateLayout(5);
    expect(b.seed).toBe(a.seed);
    expect(b.pegs).toEqual(a.pegs);
    expect(b.targetLane).toBe(a.targetLane);
    expect(b.requiredTint).toBe(a.requiredTint);
  });

  it('is never solvable by doing nothing, and is solvable within the budget', () => {
    for (let index = 0; index < TOTAL_ROUTES; index += 4) {
      const layout = generateLayout(index);
      expect(isSolvableWithoutGates(layout)).toBe(false);
      const solution = minimalSolution(layout);
      expect(solution).not.toBeNull();
      expect(solution ? solution.cost : 99).toBeLessThanOrEqual(layout.budget);
      // The recorded solution really does land in the target slot.
      const played = simulate(layout, solution ? solution.gates : {});
      expect(played.landedLane).toBe(layout.targetLane);
      expect(played.tint).toBe(layout.requiredTint);
      expect(played.solved).toBe(true);
    }
  });

  it('gives two different routes two different layouts', () => {
    const a = generateLayout(0);
    const b = generateLayout(1);
    const sameBias = a.pegs.map(p => p.bias).join('') === b.pegs.map(p => p.bias).join('');
    expect(sameBias && a.targetLane === b.targetLane).toBe(false);
  });

  it('falls back to a hand-written layout that is solvable by construction', () => {
    for (let chapter = 0; chapter < 4; chapter++) {
      const { layout, gates } = buildFallback(routeDescriptor(chapter * 6));
      expect(layout.pegs).toHaveLength(ROWS * LANES);
      expect(isSolvableWithoutGates(layout)).toBe(false);
      // The written-down gate set really does solve it.
      expect(simulate(layout, gates).solved).toBe(true);
      expect(Object.keys(gates).length).toBeLessThanOrEqual(layout.budget);
    }
  });
});
