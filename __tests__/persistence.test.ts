import {
  applyRouteOutcome,
  clearProgress,
  defaultProgress,
  deserialize,
  loadProgress,
  recordDaily,
  saveProgress,
  serialize,
  setStorageBackend,
  updateSettings,
  type KeyValueStore,
} from '../src/storage/progressStore';

function makeStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: async key => (map.has(key) ? (map.get(key) as string) : null),
    setItem: async (key, value) => {
      map.set(key, value);
    },
    removeItem: async key => {
      map.delete(key);
    },
  };
}

describe('offline-first local persistence', () => {
  it('reloads routes, settings and daily history identically', async () => {
    const store = makeStore();
    setStorageBackend(store);

    let progress = applyRouteOutcome(defaultProgress(), {
      routeIndex: 0,
      solved: true,
      stars: 3,
      redirectsUsed: 2,
      drops: 1,
    });
    progress = recordDaily(progress, { day: 20261110, solved: true, redirects: 3 });
    progress = updateSettings(progress, { highContrast: true, dropSpeed: 'SLOW' });
    expect(await saveProgress(progress)).toBe(true);

    // A force-stop is just a fresh read of the same device-local key.
    const reloaded = await loadProgress();
    expect(reloaded.recovered).toBe(false);
    expect(reloaded.progress.routes[0].stars).toBe(3);
    expect(reloaded.progress.routes[1].unlocked).toBe(true);
    expect(reloaded.progress.daily).toEqual([{ day: 20261110, solved: true, redirects: 3 }]);
    expect(reloaded.progress.settings.highContrast).toBe(true);
    expect(reloaded.progress.settings.dropSpeed).toBe('SLOW');
  });

  it('returns defaults for an empty store without flagging an error', () => {
    const result = deserialize(null);
    expect(result.recovered).toBe(false);
    expect(result.progress.routes[0].unlocked).toBe(true);
  });

  it('recovers from a corrupted save instead of throwing', () => {
    const result = deserialize('{not json');
    expect(result.recovered).toBe(true);
    expect(result.progress.routes).toHaveLength(defaultProgress().routes.length);
  });

  it('repairs individual malformed route records', () => {
    const broken = JSON.parse(serialize(defaultProgress()));
    broken.routes[2] = { stars: 99, bestRedirects: 'nope' };
    const result = deserialize(JSON.stringify(broken));
    expect(result.progress.routes[2].stars).toBe(3);
    expect(result.progress.routes[2].bestRedirects).toBeNull();
  });

  it('clears everything on request', async () => {
    const store = makeStore();
    setStorageBackend(store);
    await saveProgress(defaultProgress());
    const fresh = await clearProgress();
    expect(store.map.size).toBe(0);
    expect(fresh.routes.every(r => !r.cleared)).toBe(true);
  });
});
