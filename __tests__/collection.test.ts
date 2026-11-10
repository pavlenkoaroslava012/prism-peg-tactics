import { ROUTES_PER_SHARD, TOTAL_SHARDS } from '../src/constants/config';
import { shardsEarned } from '../src/game/scoring';
import { SHARDS, shardRequirement } from '../src/game/shards';
import { applyRouteOutcome, defaultProgress, threeStarCount } from '../src/storage/progressStore';

describe('prism shard collection', () => {
  it('describes twelve distinct, themed shards', () => {
    expect(SHARDS).toHaveLength(TOTAL_SHARDS);
    expect(new Set(SHARDS.map(s => s.name)).size).toBe(TOTAL_SHARDS);
    SHARDS.forEach(shard => {
      expect(shard.lore.length).toBeGreaterThan(20);
      expect(shard.name).not.toMatch(/item|lorem|placeholder/i);
    });
  });

  it('cuts one shard per two three-star routes', () => {
    expect(shardsEarned(0)).toBe(0);
    expect(shardsEarned(1)).toBe(0);
    expect(shardsEarned(ROUTES_PER_SHARD)).toBe(1);
    expect(shardsEarned(ROUTES_PER_SHARD * 3)).toBe(3);
  });

  it('never exceeds the collection size', () => {
    expect(shardsEarned(1000)).toBe(TOTAL_SHARDS);
  });

  it('unlocks a shard once two routes reach three stars', () => {
    let progress = defaultProgress();
    progress = applyRouteOutcome(progress, {
      routeIndex: 0,
      solved: true,
      stars: 3,
      redirectsUsed: 2,
      drops: 1,
    });
    expect(shardsEarned(threeStarCount(progress))).toBe(0);
    progress = applyRouteOutcome(progress, {
      routeIndex: 1,
      solved: true,
      stars: 3,
      redirectsUsed: 2,
      drops: 1,
    });
    expect(shardsEarned(threeStarCount(progress))).toBe(1);
  });

  it('states the requirement for a locked shard', () => {
    expect(shardRequirement(SHARDS[0])).toContain('3 STARS');
  });
});
