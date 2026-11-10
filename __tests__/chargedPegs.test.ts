import { CHARGE_QUOTA, ENTRY_LANE, ROWS } from '../src/constants/config';
import { GATE_LEFT, pegId, simulate } from '../src/game/boardSim';
import { makeLayout } from './support/fixtures';

/** Mirrors the refund rule in useRouteEngine.resolveDrop. */
function refundFor(previous: string[], touched: string[], alreadyRefunded: boolean) {
  const seen = new Set(previous);
  const newly = touched.filter(id => !seen.has(id));
  return { newly: newly.length, refunded: !alreadyRefunded && newly.length >= CHARGE_QUOTA };
}

describe('charged pegs refund a redirect', () => {
  const layout = makeLayout((r, c) => ((r + c) % 3 === 0 ? -1 : 1));

  it('lights every peg the orb touches', () => {
    const sim = simulate(layout, {});
    expect(sim.chargedPegs).toHaveLength(ROWS);
    expect(new Set(sim.chargedPegs).size).toBeGreaterThan(1);
  });

  it('refunds one redirect the first time the quota is met', () => {
    const sim = simulate(layout, {});
    const first = refundFor([], sim.chargedPegs, false);
    expect(first.newly).toBeGreaterThanOrEqual(CHARGE_QUOTA);
    expect(first.refunded).toBe(true);
  });

  it('refunds only once per route attempt', () => {
    const sim = simulate(layout, {});
    expect(refundFor([], sim.chargedPegs, true).refunded).toBe(false);
  });

  it('does not refund for pegs that were already lit', () => {
    const sim = simulate(layout, {});
    const repeat = refundFor(sim.chargedPegs, sim.chargedPegs, false);
    expect(repeat.newly).toBe(0);
    expect(repeat.refunded).toBe(false);
  });

  it('counts the pegs of an exploratory route, not just the straight fall', () => {
    const steered = simulate(layout, { [pegId(0, ENTRY_LANE)]: GATE_LEFT });
    const newly = refundFor([], steered.chargedPegs, false);
    expect(newly.newly).toBe(ROWS);
  });
});
