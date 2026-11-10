import { ENTRY_LANE, LANES, ROWS } from '../../src/constants/config';
import type { Layout, PegDef } from '../../src/game/boardSim';
import type { TintKey } from '../../src/constants/theme';

/** Hand-built board so the pure logic can be exercised without the generator. */
export function makeLayout(
  bias: (row: number, col: number) => -1 | 1,
  tint: (row: number, col: number) => TintKey | null = () => null,
  overrides: Partial<Layout> = {},
): Layout {
  const pegs: PegDef[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < LANES; col++) {
      pegs.push({ row, col, bias: bias(row, col), tint: tint(row, col) });
    }
  }
  return {
    id: 'TEST',
    seed: 1,
    rows: ROWS,
    lanes: LANES,
    entryLane: ENTRY_LANE,
    targetLane: 0,
    requiredTint: null,
    par: 2,
    budget: 3,
    scans: 2,
    chapter: 0,
    pegs,
    ...overrides,
  };
}
