/**
 * Local persistence only. No network code exists anywhere in this project.
 *
 * The backend is resolved at runtime: when a key/value store is linked into
 * the app it is used, otherwise an in-memory map keeps the session coherent.
 * Everything below the adapter is pure, serialisable data so it can be unit
 * tested without native modules.
 */
import { DEFAULT_DROP_SPEED, TOTAL_ROUTES, type DropSpeed } from '../constants/config';

export const STORAGE_KEY = 'prism-peg-tactics/progress/v1';
export const SCHEMA_VERSION = 1;

export interface RouteRecord {
  unlocked: boolean;
  cleared: boolean;
  stars: number;
  bestRedirects: number | null;
  attempts: number;
  oneShot: boolean;
}

export interface DailyEntry {
  /** YYYYMMDD */
  day: number;
  solved: boolean;
  redirects: number;
}

export interface Settings {
  routePreview: boolean;
  biasMarkers: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  dropSpeed: DropSpeed;
}

export interface Progress {
  version: number;
  routes: RouteRecord[];
  daily: DailyEntry[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  routePreview: true,
  biasMarkers: true,
  highContrast: false,
  reducedMotion: false,
  dropSpeed: DEFAULT_DROP_SPEED,
};

export function emptyRoute(index: number): RouteRecord {
  return {
    unlocked: index === 0,
    cleared: false,
    stars: 0,
    bestRedirects: null,
    attempts: 0,
    oneShot: false,
  };
}

export function defaultProgress(): Progress {
  return {
    version: SCHEMA_VERSION,
    routes: Array.from({ length: TOTAL_ROUTES }, (_, i) => emptyRoute(i)),
    daily: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function serialize(progress: Progress): string {
  return JSON.stringify(progress);
}

export interface LoadResult {
  progress: Progress;
  recovered: boolean;
}

/**
 * Never throws. A corrupted save returns defaults with recovered=true so the
 * UI can show its themed error state instead of a blank grid.
 */
export function deserialize(raw: string | null | undefined): LoadResult {
  if (raw === null || raw === undefined || raw.length === 0) {
    return { progress: defaultProgress(), recovered: false };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.routes)) {
      return { progress: defaultProgress(), recovered: true };
    }
    const base = defaultProgress();
    const routes = base.routes.map((fallback, i) => {
      const stored = parsed.routes ? (parsed.routes[i] as RouteRecord | undefined) : undefined;
      if (stored === undefined || typeof stored !== 'object') {return fallback;}
      return {
        unlocked: stored.unlocked === true || i === 0,
        cleared: stored.cleared === true,
        stars: clampStars(stored.stars),
        bestRedirects:
          typeof stored.bestRedirects === 'number' && isFinite(stored.bestRedirects)
            ? stored.bestRedirects
            : null,
        attempts: typeof stored.attempts === 'number' && stored.attempts > 0 ? stored.attempts : 0,
        oneShot: stored.oneShot === true,
      };
    });
    const daily = Array.isArray(parsed.daily)
      ? parsed.daily
          .filter((d): d is DailyEntry => d !== null && typeof d === 'object' && typeof d.day === 'number')
          .slice(-14)
      : [];
    const settings: Settings = { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) };
    settings.dropSpeed =
      settings.dropSpeed === 'SLOW' || settings.dropSpeed === 'FAST' ? settings.dropSpeed : 'NORMAL';
    return { progress: { version: SCHEMA_VERSION, routes, daily, settings }, recovered: false };
  } catch (e) {
    return { progress: defaultProgress(), recovered: true };
  }
}

function clampStars(value: unknown): number {
  if (typeof value !== 'number' || !isFinite(value)) {return 0;}
  return Math.max(0, Math.min(3, Math.round(value)));
}

// ---------------------------------------------------------------------------
// Backend adapter
// ---------------------------------------------------------------------------

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: async key => (map.has(key) ? (map.get(key) as string) : null),
    setItem: async (key, value) => {
      map.set(key, value);
    },
    removeItem: async key => {
      map.delete(key);
    },
  };
}

let backend: KeyValueStore = createMemoryStore();

/** Lets the app (or a test) swap in a real device-local store. */
export function setStorageBackend(store: KeyValueStore): void {
  backend = store;
}

export async function loadProgress(): Promise<LoadResult> {
  try {
    const raw = await backend.getItem(STORAGE_KEY);
    return deserialize(raw);
  } catch (e) {
    return { progress: defaultProgress(), recovered: true };
  }
}

export async function saveProgress(progress: Progress): Promise<boolean> {
  try {
    await backend.setItem(STORAGE_KEY, serialize(progress));
    return true;
  } catch (e) {
    return false;
  }
}

export async function clearProgress(): Promise<Progress> {
  try {
    await backend.removeItem(STORAGE_KEY);
  } catch (e) {
    // A failed clear still resets the in-memory state below.
  }
  return defaultProgress();
}

// ---------------------------------------------------------------------------
// Pure reducers over Progress
// ---------------------------------------------------------------------------

export interface RouteOutcome {
  routeIndex: number;
  solved: boolean;
  stars: number;
  redirectsUsed: number;
  drops: number;
}

export function applyRouteOutcome(progress: Progress, outcome: RouteOutcome): Progress {
  const routes = progress.routes.map(r => ({ ...r }));
  const record = routes[outcome.routeIndex];
  if (record === undefined) {return progress;}

  record.attempts += 1;
  if (outcome.solved) {
    record.cleared = true;
    record.stars = Math.max(record.stars, outcome.stars);
    record.bestRedirects =
      record.bestRedirects === null
        ? outcome.redirectsUsed
        : Math.min(record.bestRedirects, outcome.redirectsUsed);
    if (outcome.drops === 1) {record.oneShot = true;}
    const next = routes[outcome.routeIndex + 1];
    if (next !== undefined) {next.unlocked = true;}
  }
  return { ...progress, routes };
}

export function recordDaily(progress: Progress, entry: DailyEntry): Progress {
  if (progress.daily.some(d => d.day === entry.day)) {return progress;}
  return { ...progress, daily: [...progress.daily, entry].slice(-14) };
}

export function updateSettings(progress: Progress, patch: Partial<Settings>): Progress {
  return { ...progress, settings: { ...progress.settings, ...patch } };
}

// ---------------------------------------------------------------------------
// Derived statistics
// ---------------------------------------------------------------------------

export function totalStars(progress: Progress): number {
  return progress.routes.reduce((sum, r) => sum + r.stars, 0);
}

export function solvedCount(progress: Progress): number {
  return progress.routes.filter(r => r.cleared).length;
}

export function threeStarCount(progress: Progress): number {
  return progress.routes.filter(r => r.stars >= 3).length;
}

export function oneShotCount(progress: Progress): number {
  return progress.routes.filter(r => r.oneShot).length;
}

export function parSolveCount(progress: Progress, pars: number[]): number {
  return progress.routes.filter(
    (r, i) => r.cleared && r.bestRedirects !== null && r.bestRedirects <= pars[i],
  ).length;
}

export function firstUnsolvedRoute(progress: Progress): number {
  const idx = progress.routes.findIndex(r => r.unlocked && !r.cleared);
  if (idx >= 0) {return idx;}
  const lastUnlocked = progress.routes.reduce((acc, r, i) => (r.unlocked ? i : acc), 0);
  return lastUnlocked;
}
