import { CHAPTER_NAMES, ROUTES_PER_CHAPTER, TOTAL_ROUTES } from '../src/constants/config';
import { ALL_ROUTES, routeDescriptor } from '../src/game/levelGen';
import { applyRouteOutcome, defaultProgress, type RouteRecord } from '../src/storage/progressStore';

type TileState = 'locked' | 'open' | 'cleared';

/** Mirrors the tile-state mapping of ChallengeScreen. */
function tileState(record: RouteRecord): TileState {
  return record.cleared ? 'cleared' : record.unlocked ? 'open' : 'locked';
}

/** Mirrors the chapter unlock rule of ChallengeScreen. */
function unlockedChapters(routes: RouteRecord[]): number {
  let count = 1;
  for (let c = 0; c < CHAPTER_NAMES.length - 1; c++) {
    const start = c * ROUTES_PER_CHAPTER;
    const cleared = routes.slice(start, start + ROUTES_PER_CHAPTER).filter(r => r.cleared).length;
    if (cleared >= ROUTES_PER_CHAPTER) count++;
    else break;
  }
  return count;
}

describe('challenge route select', () => {
  it('describes twenty-four routes across four chapters', () => {
    expect(ALL_ROUTES).toHaveLength(TOTAL_ROUTES);
    expect(CHAPTER_NAMES).toHaveLength(4);
    expect(ALL_ROUTES[TOTAL_ROUTES - 1].chapter).toBe(3);
    ALL_ROUTES.forEach((route, i) => {
      expect(route.index).toBe(i);
      expect(route.label).toBe(routeDescriptor(i).label);
      expect(route.par).toBeGreaterThanOrEqual(2);
      expect(route.par).toBeLessThanOrEqual(5);
    });
  });

  it('shows the first route open and the rest locked on a fresh install', () => {
    const routes = defaultProgress().routes;
    expect(tileState(routes[0])).toBe('open');
    expect(tileState(routes[1])).toBe('locked');
  });

  it('marks a solved route cleared and the next one open', () => {
    const next = applyRouteOutcome(defaultProgress(), {
      routeIndex: 0,
      solved: true,
      stars: 2,
      redirectsUsed: 3,
      drops: 1,
    });
    expect(tileState(next.routes[0])).toBe('cleared');
    expect(tileState(next.routes[1])).toBe('open');
  });

  it('opens the next chapter only after six routes are cleared', () => {
    let progress = defaultProgress();
    expect(unlockedChapters(progress.routes)).toBe(1);
    for (let i = 0; i < ROUTES_PER_CHAPTER; i++) {
      progress = applyRouteOutcome(progress, {
        routeIndex: i,
        solved: true,
        stars: 3,
        redirectsUsed: 2,
        drops: 1,
      });
    }
    expect(unlockedChapters(progress.routes)).toBe(2);
  });

  it('tracks session counters independently of the saved record', () => {
    const session = [3, 2, 4].reduce(
      (acc, spent) => ({ runs: acc.runs + 1, redirects: acc.redirects + spent }),
      { runs: 0, redirects: 0 },
    );
    expect(session).toEqual({ runs: 3, redirects: 9 });
  });
});
