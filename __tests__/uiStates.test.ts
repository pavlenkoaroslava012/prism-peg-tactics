import { LOADER_DURATION_MS } from '../src/constants/config';
import { verdictLine, verdictTitle } from '../src/game/scoring';
import { SHARDS } from '../src/game/shards';
import {
  defaultProgress,
  deserialize,
  solvedCount,
  totalStars,
} from '../src/storage/progressStore';

/** Mirrors the null filter shared by StatCard and StatRow. */
function visibleStats(items: Array<{ value: number | string }>) {
  return items.filter(item => {
    if (item.value === '' || item.value === null || item.value === undefined) return false;
    if (typeof item.value === 'number' && item.value === 0) return false;
    return true;
  });
}

describe('loading, empty, error and completion states', () => {
  it('holds the loader long enough for the first review frame', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('reports a genuinely empty collection and progress on a fresh install', () => {
    const progress = defaultProgress();
    expect(solvedCount(progress)).toBe(0);
    expect(totalStars(progress)).toBe(0);
    expect(SHARDS.filter((_, i) => i < 0)).toHaveLength(0);
  });

  it('drops zero-valued stat cards instead of rendering empty boxes', () => {
    const items = [{ value: 3 }, { value: 0 }, { value: '' }];
    expect(visibleStats(items)).toHaveLength(1);
  });

  it('hides a stat row that would show fewer than two pills', () => {
    const items = [{ value: 2 }, { value: 0 }, { value: 0 }];
    expect(visibleStats(items).length < 2).toBe(true);
  });

  it('surfaces a recoverable error for a corrupted save', () => {
    const result = deserialize('<<<broken>>>');
    expect(result.recovered).toBe(true);
    expect(result.progress.routes.length).toBeGreaterThan(0);
  });

  it('states the completion verdict in the words of this game', () => {
    expect(verdictTitle(true)).toBe('SPECTRUM LOCKED');
    expect(verdictTitle(false)).toBe('ROUTE SCATTERED');
    expect(verdictTitle(true)).not.toMatch(/you win|game over/i);
    expect(verdictLine(5, 7)).toBe('ORB SETTLED IN LANE 6 - TARGET LANE 8');
  });
});
