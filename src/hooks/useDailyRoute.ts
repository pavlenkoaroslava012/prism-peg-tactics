import { useEffect, useMemo, useState } from 'react';
import { dailySeed, dateKey } from '../game/rng';
import type { DailyEntry } from '../storage/progressStore';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatDay(d: Date): string {
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}

export function msUntilMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

/** Seven-day strip, oldest first, for the Daily history dots. */
export function recentDays(entries: DailyEntry[], now: Date, count = 7) {
  const out: Array<{ day: number; state: 'solved' | 'missed' | 'none' }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dateKey(d);
    const entry = entries.find(e => e.day === key);
    out.push({
      day: key,
      state: entry === undefined ? 'none' : entry.solved ? 'solved' : 'missed',
    });
  }
  return out;
}

/**
 * One generated board per calendar day: identical on every launch that day,
 * different the next. The tick is cleared on unmount.
 */
export function useDailyRoute(entries: DailyEntry[], active: boolean) {
  const [now, setNow] = useState(() => new Date());

  // The tick only runs while the Daily screen is on screen, so the rest of
  // the app is never re-rendered once a second.
  useEffect(() => {
    if (!active) {return;}
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const today = useMemo(() => dateKey(now), [now]);
  const seed = useMemo(() => dailySeed(now), [today]); // eslint-disable-line react-hooks/exhaustive-deps
  const played = useMemo(() => entries.find(e => e.day === today), [entries, today]);

  return {
    now,
    today,
    seed,
    dateLabel: formatDay(now),
    countdown: formatCountdown(msUntilMidnight(now)),
    played: played === undefined ? null : played,
    history: recentDays(entries, now),
  };
}

export default useDailyRoute;
