/**
 * Pure board simulation — no React, no native modules, fully unit-testable.
 * The fall is deterministic: the same layout plus the same gates always
 * returns the identical lane path. There is no RNG at drop time.
 */
import type { TintKey } from '../constants/theme';

export const GATE_LEFT = 0;
export const GATE_RIGHT = 1;
export const GATE_PRISM = 2;
export type GateState = 0 | 1 | 2;
export const GATE_CYCLE: GateState[] = [GATE_LEFT, GATE_RIGHT, GATE_PRISM];

export interface PegDef {
  row: number;
  col: number;
  /** Fixed deflection the player reads off the bias marker. */
  bias: -1 | 1;
  /** A prism node: a PRISM gate here repaints the orb with this tint. */
  tint: TintKey | null;
}

export interface Layout {
  id: string;
  seed: number;
  rows: number;
  lanes: number;
  entryLane: number;
  targetLane: number;
  requiredTint: TintKey | null;
  par: number;
  budget: number;
  scans: number;
  chapter: number;
  pegs: PegDef[];
}

export type Gates = Record<string, GateState>;

export interface PathNode {
  row: number;
  lane: number;
}

export interface SimResult {
  /** row -1 is the funnel mouth, row === layout.rows is the slot row. */
  path: PathNode[];
  landedLane: number;
  tint: TintKey | null;
  chargedPegs: string[];
  wallSparkRows: number[];
  solved: boolean;
}

export function pegId(row: number, col: number): string {
  return row + ':' + col;
}

export function pegAt(layout: Layout, row: number, col: number): PegDef {
  return layout.pegs[row * layout.lanes + col];
}

export function deflectionFor(peg: PegDef, gate: GateState | undefined): -1 | 0 | 1 {
  if (gate === GATE_LEFT) {return -1;}
  if (gate === GATE_RIGHT) {return 1;}
  if (gate === GATE_PRISM) {return 0;}
  return peg.bias;
}

/**
 * Wall rule: a deflection into a wall reflects inward instead of clamping,
 * which is what makes edge lanes a tactical tool rather than a dead end.
 */
export function applyLane(lane: number, deflection: number, lanes: number): { lane: number; wall: boolean } {
  const next = lane + deflection;
  if (next < 0) {return { lane: lane + 1, wall: true };}
  if (next > lanes - 1) {return { lane: lane - 1, wall: true };}
  return { lane: next, wall: false };
}

export function simulate(layout: Layout, gates: Gates): SimResult {
  const path: PathNode[] = [{ row: -1, lane: layout.entryLane }];
  const chargedPegs: string[] = [];
  const wallSparkRows: number[] = [];
  let lane = layout.entryLane;
  let tint: TintKey | null = null;

  for (let row = 0; row < layout.rows; row++) {
    path.push({ row, lane });
    const peg = pegAt(layout, row, lane);
    const id = pegId(row, lane);
    chargedPegs.push(id);
    const gate = gates[id];
    if (gate === GATE_PRISM && peg.tint) {
      tint = peg.tint;
    }
    const step = applyLane(lane, deflectionFor(peg, gate), layout.lanes);
    if (step.wall) {wallSparkRows.push(row);}
    lane = step.lane;
  }

  path.push({ row: layout.rows, lane });

  const solved = lane === layout.targetLane && tint === layout.requiredTint;
  return { path, landedLane: lane, tint, chargedPegs, wallSparkRows, solved };
}

/** Pegs the orb actually touches — the only placements worth searching. */
export function touchedPegs(layout: Layout, gates: Gates): string[] {
  return simulate(layout, gates).chargedPegs;
}
