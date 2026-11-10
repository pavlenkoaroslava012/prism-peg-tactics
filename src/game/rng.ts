/* eslint-disable no-bitwise -- a hash-based PRNG is bit arithmetic by definition */
/**
 * Deterministic, local PRNG. Never Math.random: every board must be
 * reproducible from its seed so a bug can be replayed.
 */
export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(rng() * span);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, 0, items.length - 1)];
}

/** One seed per attempt, logged with the route so a layout is reproducible. */
export function routeSeed(routeIndex: number, attempt: number): number {
  return ((routeIndex + 1) * 7919) ^ ((attempt + 1) * 104729);
}

/** YYYYMMDD of a local date — the Daily Mode seed. */
export function dateKey(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function dailySeed(d: Date): number {
  return (dateKey(d) * 2654435761) >>> 0;
}
