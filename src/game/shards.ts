/**
 * The twelve prism shards of the Collection. Each one names the spectrum
 * lesson it teaches and the route it was cut from - themed content, never
 * "Item 1" placeholders.
 */
import type { TintKey } from '../constants/theme';

export interface Shard {
  id: number;
  name: string;
  tint: TintKey;
  lore: string;
  sourceRoute: number;
}

export const SHARDS: Shard[] = [
  { id: 0, name: 'AZURE FACET', tint: 'cyan', lore: 'The first clean cut. Bends a beam one lane without spending a second gate.', sourceRoute: 1 },
  { id: 1, name: 'VIOLET CORE', tint: 'violet', lore: 'Dense centre glass. Holds the orb straight down through a biased peg.', sourceRoute: 3 },
  { id: 2, name: 'MAGENTA EDGE', tint: 'magenta', lore: 'Cut from a wall bounce. Marks the lane where reflection beats placement.', sourceRoute: 5 },
  { id: 3, name: 'SPLIT PRISM', tint: 'cyan', lore: 'Two routes share its face. Reading the second one is the whole trick.', sourceRoute: 7 },
  { id: 4, name: 'DRIFT LENS', tint: 'violet', lore: 'Collected from a route solved under par. Rewards planning over dropping.', sourceRoute: 9 },
  { id: 5, name: 'ECHO SHARD', tint: 'magenta', lore: 'Lit by five pegs in one fall. Proof that exploring pays its own way.', sourceRoute: 11 },
  { id: 6, name: 'REFRACT KEY', tint: 'cyan', lore: 'Turns a gate instead of adding one. Rotation is free; placement is not.', sourceRoute: 13 },
  { id: 7, name: 'NULL FACET', tint: 'violet', lore: 'A prism that takes no tint. The quiet answer to a colourless slot.', sourceRoute: 15 },
  { id: 8, name: 'WALL SPARK', tint: 'magenta', lore: 'Fused at lane one. The inward reflection that saved a redirect.', sourceRoute: 17 },
  { id: 9, name: 'APEX GLASS', tint: 'cyan', lore: 'Cut at the top row, where a single bias decides eight rows of fall.', sourceRoute: 19 },
  { id: 10, name: 'SPECTRUM SEAL', tint: 'violet', lore: 'Locks tint and lane together. Earned only by a first-drop solve.', sourceRoute: 21 },
  { id: 11, name: 'PRISM CROWN', tint: 'magenta', lore: 'The last facet. Every chapter contributed one of its twelve edges.', sourceRoute: 23 },
];

export function shardRequirement(shard: Shard): string {
  return '3 STARS - ROUTE ' + String(shard.sourceRoute + 1).padStart(2, '0');
}
