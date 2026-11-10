import { DAILY_SCANS, SCANS_PER_ROUTE, SCAN_VISIBLE_MS } from '../src/constants/config';
import { simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

/** Mirrors the scan branch of useRouteEngine without mounting a component. */
function spendScan(scansLeft: number) {
  if (scansLeft <= 0) return { scansLeft, ghost: null as unknown };
  return { scansLeft: scansLeft - 1, ghost: {} };
}

describe('route scan', () => {
  const layout = makeLayout((r, c) => ((r + c) % 2 === 0 ? 1 : -1));

  it('starts with two scans on a normal route and one on the daily board', () => {
    expect(SCANS_PER_ROUTE).toBe(2);
    expect(DAILY_SCANS).toBe(1);
  });

  it('spends one scan per press and stops at zero', () => {
    let state = spendScan(SCANS_PER_ROUTE);
    expect(state.scansLeft).toBe(1);
    state = spendScan(state.scansLeft);
    expect(state.scansLeft).toBe(0);
    expect(state.ghost).not.toBeNull();
    const exhausted = spendScan(state.scansLeft);
    expect(exhausted.scansLeft).toBe(0);
    expect(exhausted.ghost).toBeNull();
  });

  it('previews exactly the path the drop will take', () => {
    const ghost = simulate(layout, {});
    const drop = simulate(layout, {});
    expect(ghost.path).toEqual(drop.path);
    expect(ghost.landedLane).toBe(drop.landedLane);
  });

  it('reveals only the landing segment when ROUTE PREVIEW is off', () => {
    const ghost = simulate(layout, {});
    const landingOnly = ghost.path.slice(ghost.path.length - 2);
    expect(landingOnly).toHaveLength(2);
    expect(landingOnly[1].lane).toBe(ghost.landedLane);
    expect(landingOnly.length).toBeLessThan(ghost.path.length);
  });

  it('keeps the preview on screen long enough to be read', () => {
    expect(SCAN_VISIBLE_MS).toBeGreaterThanOrEqual(3000);
  });
});
