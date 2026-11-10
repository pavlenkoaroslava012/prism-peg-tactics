import { dailySeed, dateKey } from '../src/game/rng';
import { generateLayout } from '../src/game/levelGen';
import { formatCountdown, msUntilMidnight, recentDays } from '../src/hooks/useDailyRoute';

describe('daily mode seeding', () => {
  const today = new Date(2026, 10, 10, 12, 0, 0);
  const tomorrow = new Date(2026, 10, 11, 12, 0, 0);

  it('derives the key from the local calendar date', () => {
    expect(dateKey(today)).toBe(20261110);
    expect(dateKey(tomorrow)).toBe(20261111);
  });

  it('produces the same seed all day and a different one the next day', () => {
    expect(dailySeed(new Date(2026, 10, 10, 1, 5))).toBe(dailySeed(new Date(2026, 10, 10, 23, 55)));
    expect(dailySeed(today)).not.toBe(dailySeed(tomorrow));
  });

  it('builds an identical board for the same day and a different one tomorrow', () => {
    const a = generateLayout(3, dailySeed(today));
    const b = generateLayout(3, dailySeed(today));
    const c = generateLayout(3, dailySeed(tomorrow));
    expect(b.pegs.map(p => p.bias)).toEqual(a.pegs.map(p => p.bias));
    expect(b.targetLane).toBe(a.targetLane);
    expect(
      c.pegs.map(p => p.bias).join('') === a.pegs.map(p => p.bias).join('') &&
        c.targetLane === a.targetLane,
    ).toBe(false);
  });

  it('counts down to local midnight', () => {
    const ms = msUntilMidnight(new Date(2026, 10, 10, 23, 0, 0));
    expect(ms).toBe(60 * 60 * 1000);
    expect(formatCountdown(ms)).toBe('01:00');
  });

  it('returns a seven-day history strip ending today', () => {
    const history = recentDays(
      [{ day: dateKey(today), solved: true, redirects: 3 }],
      today,
    );
    expect(history).toHaveLength(7);
    expect(history[6].state).toBe('solved');
    expect(history[0].state).toBe('none');
  });
});
