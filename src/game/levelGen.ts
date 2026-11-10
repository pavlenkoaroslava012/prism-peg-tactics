/**
 * Seeded route generation with a solvability check.
 *
 * Quantities come from the route descriptor; PLACEMENT comes from the seeded
 * generator, so two routes differ in layout and not only in a HUD number.
 * A layout is shown only when it is solvable within the gate budget AND not
 * solvable with zero gates. After MAX_GEN_ATTEMPTS the hand-written chapter
 * fallback is used - a guarantee, not the game.
 *
 * Nothing here runs at module load: generation is kicked off when a route
 * starts, so app launch never does heavy synchronous work.
 */
import {
  CHAPTER_COUNT,
  ENTRY_LANE,
  LANES,
  MAX_GEN_ATTEMPTS,
  MAX_SOLVER_DEPTH,
  MAX_SOLVER_NODES,
  ROUTES_PER_CHAPTER,
  ROWS,
} from '../constants/config';
import { TINT_KEYS, type TintKey } from '../constants/theme';
import {
  GATE_LEFT,
  GATE_PRISM,
  GATE_RIGHT,
  pegId,
  simulate,
  type GateState,
  type Gates,
  type Layout,
  type PegDef,
} from './boardSim';
import { makeRng, randInt, routeSeed, type Rng } from './rng';

export interface RouteDescriptor {
  index: number;
  chapter: number;
  indexInChapter: number;
  par: number;
  budget: number;
  scans: number;
  label: string;
}

const PAR_BY_CHAPTER = [2, 3, 4, 5];

export function routeDescriptor(index: number): RouteDescriptor {
  const chapter = Math.min(CHAPTER_COUNT - 1, Math.floor(index / ROUTES_PER_CHAPTER));
  const indexInChapter = index - chapter * ROUTES_PER_CHAPTER;
  const par = PAR_BY_CHAPTER[chapter];
  // Chapters 1-2 give one spare redirect; chapters 3-4 sit exactly at par.
  const budget = chapter <= 1 ? par + 1 : par;
  return {
    index,
    chapter,
    indexInChapter,
    par,
    budget,
    scans: 2,
    label: 'ROUTE ' + String(index + 1).padStart(2, '0'),
  };
}

export const ALL_ROUTES: RouteDescriptor[] = Array.from(
  { length: CHAPTER_COUNT * ROUTES_PER_CHAPTER },
  (_, i) => routeDescriptor(i),
);

// ---------------------------------------------------------------------------
// Reachability search
// ---------------------------------------------------------------------------

export interface Outcome {
  lane: number;
  tint: TintKey | null;
  cost: number;
  gates: Gates;
}

function gatesKey(gates: Gates): string {
  return Object.keys(gates)
    .sort()
    .map(k => k + '=' + gates[k])
    .join(',');
}

function outcomeKey(lane: number, tint: TintKey | null): string {
  return lane + '|' + (tint === null ? '-' : tint);
}

/**
 * Breadth-first enumeration of gate placements. Only pegs the orb actually
 * touches are worth gating, which keeps the branching factor at rows x 3.
 */
export function explore(
  layout: Layout,
  maxDepth: number = MAX_SOLVER_DEPTH,
  nodeBudget: number = MAX_SOLVER_NODES,
): Map<string, Outcome> {
  const best = new Map<string, Outcome>();
  const seen = new Set<string>();
  let frontier: Gates[] = [{}];
  let nodes = 0;

  for (let depth = 0; depth <= maxDepth; depth++) {
    const next: Gates[] = [];
    for (let i = 0; i < frontier.length; i++) {
      const gates = frontier[i];
      const key = gatesKey(gates);
      if (seen.has(key)) {continue;}
      seen.add(key);
      nodes++;

      const sim = simulate(layout, gates);
      const oKey = outcomeKey(sim.landedLane, sim.tint);
      const existing = best.get(oKey);
      if (!existing || existing.cost > depth) {
        best.set(oKey, { lane: sim.landedLane, tint: sim.tint, cost: depth, gates });
      }

      if (depth === maxDepth || nodes >= nodeBudget) {continue;}

      for (let p = 0; p < sim.chargedPegs.length; p++) {
        const id = sim.chargedPegs[p];
        if (gates[id] !== undefined) {continue;}
        for (let s = 0; s < 3; s++) {
          next.push({ ...gates, [id]: s as GateState });
        }
      }
    }
    if (nodes >= nodeBudget) {break;}
    frontier = next;
    if (frontier.length === 0) {break;}
  }

  return best;
}

/** Fewest gate placements that solve the layout, or null when unsolvable. */
export function minimalSolution(
  layout: Layout,
  maxDepth: number = MAX_SOLVER_DEPTH,
): Outcome | null {
  const outcomes = explore(layout, maxDepth);
  const hit = outcomes.get(outcomeKey(layout.targetLane, layout.requiredTint));
  return hit === undefined ? null : hit;
}

export function isSolvableWithoutGates(layout: Layout): boolean {
  const sim = simulate(layout, {});
  return sim.landedLane === layout.targetLane && sim.tint === layout.requiredTint;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function buildPegs(rng: Rng, chapter: number): PegDef[] {
  const pegs: PegDef[] = [];
  // More prism nodes deeper in the game, so the tint decision gets richer.
  const tintChance = 0.07 + chapter * 0.035;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < LANES; col++) {
      const bias: -1 | 1 = rng() < 0.5 ? -1 : 1;
      const tint: TintKey | null =
        row > 0 && rng() < tintChance ? TINT_KEYS[randInt(rng, 0, TINT_KEYS.length - 1)] : null;
      pegs.push({ row, col, bias, tint });
    }
  }
  return pegs;
}

function draftLayout(desc: RouteDescriptor, seed: number, rng: Rng): Layout {
  return {
    id: desc.label,
    seed,
    rows: ROWS,
    lanes: LANES,
    entryLane: ENTRY_LANE,
    targetLane: 0,
    requiredTint: null,
    par: desc.par,
    budget: desc.budget,
    scans: desc.scans,
    chapter: desc.chapter,
    pegs: buildPegs(rng, desc.chapter),
  };
}

/**
 * Picks the target slot out of what the board can actually reach, so the route
 * is solvable by construction and never solvable by doing nothing.
 */
function chooseTarget(
  layout: Layout,
  desc: RouteDescriptor,
  rng: Rng,
  reachable: Map<string, Outcome>,
): Outcome | null {
  const wantTint = desc.chapter >= 1;
  const wantedCost = Math.max(1, Math.min(desc.par, MAX_SOLVER_DEPTH));
  const outcomes = Array.from(reachable.values()).filter(o => o.cost >= 1);
  if (outcomes.length === 0) {return null;}

  const tiers: Outcome[][] = [
    outcomes.filter(o => o.cost === wantedCost && (wantTint ? o.tint !== null : o.tint === null)),
    outcomes.filter(o => o.cost === wantedCost),
    outcomes.filter(o => o.cost >= Math.max(1, wantedCost - 1)),
    outcomes,
  ];
  for (let t = 0; t < tiers.length; t++) {
    const tier = tiers[t];
    if (tier.length > 0) {return tier[randInt(rng, 0, tier.length - 1)];}
  }
  return null;
}

export function generateLayout(routeIndex: number, seedOverride?: number): Layout {
  const desc = routeDescriptor(routeIndex);
  for (let attempt = 0; attempt < MAX_GEN_ATTEMPTS; attempt++) {
    const seed =
      seedOverride === undefined ? routeSeed(routeIndex, attempt) : (seedOverride ^ (attempt * 7919)) >>> 0;
    const rng = makeRng(seed);
    const layout = draftLayout(desc, seed, rng);
    // One reachability pass per attempt: it picks the target AND proves the
    // minimum gate count, so the solver never runs twice over the same board.
    const reachable = explore(layout);
    const target = chooseTarget(layout, desc, rng, reachable);
    if (target === null) {continue;}
    if (target.cost < 1 || target.cost > desc.budget) {continue;}
    layout.targetLane = target.lane;
    layout.requiredTint = target.tint;
    if (isSolvableWithoutGates(layout)) {continue;}
    return layout;
  }
  return buildFallback(desc).layout;
}

// ---------------------------------------------------------------------------
// Fallback - hand-written, solvable by construction
// ---------------------------------------------------------------------------

/** The written-down opening for each chapter fallback board. */
const FALLBACK_PLAN: GateState[][] = [
  [GATE_LEFT, GATE_LEFT],
  [GATE_RIGHT, GATE_PRISM, GATE_LEFT],
  [GATE_LEFT, GATE_PRISM, GATE_RIGHT, GATE_LEFT],
  [GATE_RIGHT, GATE_LEFT, GATE_PRISM, GATE_RIGHT, GATE_LEFT],
];

export interface FallbackBoard {
  layout: Layout;
  /** The gate set that solves it — written down, not searched for. */
  gates: Gates;
}

/**
 * The guarantee behind the generator. Biases and prism nodes come from a
 * fixed formula and the target slot is whatever the written-down opening
 * reaches, so the board is solvable by construction. If that opening happens
 * to be a no-op the target is taken from the reachability map instead, which
 * keeps "doing nothing never wins" true for every chapter.
 */
export function buildFallback(desc: RouteDescriptor): FallbackBoard {
  const pegs: PegDef[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < LANES; col++) {
      const bias: -1 | 1 = (row + col) % 2 === 0 ? 1 : -1;
      const tint: TintKey | null = row % 3 === 1 ? TINT_KEYS[(row + col) % TINT_KEYS.length] : null;
      pegs.push({ row, col, bias, tint });
    }
  }
  const layout: Layout = {
    id: desc.label,
    seed: -(desc.chapter + 1),
    rows: ROWS,
    lanes: LANES,
    entryLane: ENTRY_LANE,
    targetLane: 0,
    requiredTint: null,
    par: desc.par,
    budget: desc.budget,
    scans: desc.scans,
    chapter: desc.chapter,
    pegs,
  };

  // Walk the written solution: each step gates the peg the orb meets at that
  // row, so the resulting landing lane IS the target by construction.
  const plan = FALLBACK_PLAN[Math.min(desc.chapter, FALLBACK_PLAN.length - 1)];
  const gates: Gates = {};
  for (let i = 0; i < plan.length; i++) {
    const sim = simulate(layout, gates);
    const node = sim.path[i + 1];
    if (node === undefined || node.row < 0 || node.row >= ROWS) {break;}
    gates[pegId(node.row, node.lane)] = plan[i];
  }
  const solved = simulate(layout, gates);
  layout.targetLane = solved.landedLane;
  layout.requiredTint = solved.tint;

  if (!isSolvableWithoutGates(layout)) {return { layout, gates };}

  // The opening was a no-op on this board: take the target from the cheapest
  // outcome that still needs at least one gate.
  const outcomes = Array.from(explore(layout).values())
    .filter(o => o.cost >= 1)
    .sort((a, b) => a.cost - b.cost || a.lane - b.lane);
  const chosen = outcomes[0];
  if (chosen === undefined) {return { layout, gates };}
  layout.targetLane = chosen.lane;
  layout.requiredTint = chosen.tint;
  return { layout, gates: chosen.gates };
}

export function fallbackLayout(desc: RouteDescriptor): Layout {
  return buildFallback(desc).layout;
}

export function buildFallbackRoutes(): Layout[] {
  return Array.from({ length: CHAPTER_COUNT }, (_, c) =>
    fallbackLayout(routeDescriptor(c * ROUTES_PER_CHAPTER)),
  );
}
