/**
 * Stars, the fewest-redirect record and shard awards. Pure logic.
 */
import { ROUTES_PER_SHARD, TOTAL_SHARDS } from '../constants/config';

export interface ScoreInput {
  solved: boolean;
  redirectsUsed: number;
  par: number;
  drops: number;
}

/**
 * 3 stars - solved at or under par on the very first drop.
 * 2 stars - solved within one redirect of par.
 * 1 star  - solved at all.
 */
export function starsFor(input: ScoreInput): number {
  if (!input.solved) {return 0;}
  if (input.redirectsUsed <= input.par && input.drops === 1) {return 3;}
  if (input.redirectsUsed <= input.par + 1) {return 2;}
  return 1;
}

/** The route record keeps the lowest redirect count ever achieved. */
export function bestRedirects(previous: number | null, current: number): number {
  if (previous === null) {return current;}
  return Math.min(previous, current);
}

/** One shard is cut per two 3-star routes, capped at the collection size. */
export function shardsEarned(threeStarRoutes: number): number {
  return Math.min(TOTAL_SHARDS, Math.floor(threeStarRoutes / ROUTES_PER_SHARD));
}

export function verdictTitle(solved: boolean): string {
  return solved ? 'SPECTRUM LOCKED' : 'ROUTE SCATTERED';
}

export function verdictLine(landedLane: number, targetLane: number): string {
  return 'ORB SETTLED IN LANE ' + (landedLane + 1) + ' - TARGET LANE ' + (targetLane + 1);
}

export function accuracyLabel(solvedRoutes: number, totalAttempts: number): string {
  if (totalAttempts <= 0) {return '0%';}
  return Math.round((solvedRoutes / totalAttempts) * 100) + '%';
}

export function averageRedirects(records: Array<number | null>): number {
  const values = records.filter((v): v is number => v !== null);
  if (values.length === 0) {return 0;}
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
