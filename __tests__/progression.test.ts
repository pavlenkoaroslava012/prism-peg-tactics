import { ROUTES_PER_CHAPTER } from '../src/constants/config';
import { routeDescriptor } from '../src/game/levelGen';
import { applyRouteOutcome, defaultProgress } from '../src/storage/progressStore';

describe('route and chapter progression', () => {
  it('starts with only the first route unlocked', () => {
    const progress = defaultProgress();
    expect(progress.routes[0].unlocked).toBe(true);
    expect(progress.routes[1].unlocked).toBe(false);
  });

  it('clears a route and unlocks the next one', () => {
    const next = applyRouteOutcome(defaultProgress(), {
      routeIndex: 0,
      solved: true,
      stars: 2,
      redirectsUsed: 3,
      drops: 2,
    });
    expect(next.routes[0].cleared).toBe(true);
    expect(next.routes[0].stars).toBe(2);
    expect(next.routes[1].unlocked).toBe(true);
  });

  it('counts a miss as an attempt without unlocking anything', () => {
    const next = applyRouteOutcome(defaultProgress(), {
      routeIndex: 0,
      solved: false,
      stars: 0,
      redirectsUsed: 1,
      drops: 1,
    });
    expect(next.routes[0].attempts).toBe(1);
    expect(next.routes[0].cleared).toBe(false);
    expect(next.routes[1].unlocked).toBe(false);
  });

  it('never lowers a stored star count', () => {
    let progress = applyRouteOutcome(defaultProgress(), {
      routeIndex: 0,
      solved: true,
      stars: 3,
      redirectsUsed: 2,
      drops: 1,
    });
    progress = applyRouteOutcome(progress, {
      routeIndex: 0,
      solved: true,
      stars: 1,
      redirectsUsed: 6,
      drops: 4,
    });
    expect(progress.routes[0].stars).toBe(3);
    expect(progress.routes[0].bestRedirects).toBe(2);
  });

  it('raises par by chapter and keeps chapters six routes long', () => {
    expect(routeDescriptor(0).chapter).toBe(0);
    expect(routeDescriptor(ROUTES_PER_CHAPTER).chapter).toBe(1);
    expect(routeDescriptor(ROUTES_PER_CHAPTER).par).toBeGreaterThan(routeDescriptor(0).par);
    expect(routeDescriptor(0).budget).toBe(routeDescriptor(0).par + 1);
    expect(routeDescriptor(ROUTES_PER_CHAPTER * 3).budget).toBe(
      routeDescriptor(ROUTES_PER_CHAPTER * 3).par,
    );
  });
});
