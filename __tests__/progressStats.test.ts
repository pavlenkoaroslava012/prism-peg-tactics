import { ROUTES_PER_CHAPTER, TOTAL_STARS } from '../src/constants/config';
import { routeDescriptor } from '../src/game/levelGen';
import { averageRedirects } from '../src/game/scoring';
import {
  applyRouteOutcome,
  defaultProgress,
  oneShotCount,
  parSolveCount,
  solvedCount,
  totalStars,
  type Progress,
} from '../src/storage/progressStore';

function solve(progress: Progress, index: number, stars: number, redirects: number, drops: number) {
  return applyRouteOutcome(progress, {
    routeIndex: index,
    solved: true,
    stars,
    redirectsUsed: redirects,
    drops,
  });
}

describe('progress statistics', () => {
  let progress: Progress;

  beforeEach(() => {
    progress = defaultProgress();
    progress = solve(progress, 0, 3, 2, 1);
    progress = solve(progress, 1, 2, 4, 3);
    progress = solve(progress, 2, 1, 6, 5);
  });

  it('aggregates stars against the full total', () => {
    expect(totalStars(progress)).toBe(6);
    expect(TOTAL_STARS).toBe(72);
  });

  it('counts solved routes and one-shot solves', () => {
    expect(solvedCount(progress)).toBe(3);
    expect(oneShotCount(progress)).toBe(1);
  });

  it('averages the best redirect count of solved routes only', () => {
    expect(averageRedirects(progress.routes.map(r => r.bestRedirects))).toBe(4);
    expect(averageRedirects([])).toBe(0);
    expect(averageRedirects([null, null])).toBe(0);
  });

  it('counts fewest-redirect solves against each route par', () => {
    const pars = progress.routes.map((_, i) => routeDescriptor(i).par);
    expect(parSolveCount(progress, pars)).toBe(1);
  });

  it('reports chapter completion as cleared over six', () => {
    const cleared = progress.routes
      .slice(0, ROUTES_PER_CHAPTER)
      .filter(r => r.cleared).length;
    expect(cleared + '/' + ROUTES_PER_CHAPTER).toBe('3/6');
  });
});
