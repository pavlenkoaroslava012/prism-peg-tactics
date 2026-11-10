import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyRouteOutcome,
  clearProgress,
  defaultProgress,
  loadProgress,
  recordDaily,
  saveProgress,
  updateSettings,
  type DailyEntry,
  type Progress,
  type RouteOutcome,
  type Settings,
} from '../storage/progressStore';

/**
 * Owns the single persisted blob. Writes are fire-and-forget so no render
 * pass ever blocks on storage, and the in-flight timer is cleared on unmount.
 */
export function usePersistentProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [ready, setReady] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const mounted = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    loadProgress().then(result => {
      if (!mounted.current) {return;}
      setProgress(result.progress);
      setRecovered(result.recovered);
      setReady(true);
    });
    return () => {
      mounted.current = false;
      if (saveTimer.current !== null) {clearTimeout(saveTimer.current);}
    };
  }, []);

  const commit = useCallback((next: Progress) => {
    setProgress(next);
    if (saveTimer.current !== null) {clearTimeout(saveTimer.current);}
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      saveProgress(next);
    }, 120);
    return next;
  }, []);

  const recordOutcome = useCallback(
    (outcome: RouteOutcome) => {
      setProgress(prev => {
        const next = applyRouteOutcome(prev, outcome);
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const recordDailyRun = useCallback((entry: DailyEntry) => {
    setProgress(prev => {
      const next = recordDaily(prev, entry);
      saveProgress(next);
      return next;
    });
  }, []);

  const patchSettings = useCallback(
    (patch: Partial<Settings>) => {
      setProgress(prev => {
        const next = updateSettings(prev, patch);
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const resetAll = useCallback(async () => {
    const fresh = await clearProgress();
    if (!mounted.current) {return;}
    setProgress(fresh);
    setRecovered(false);
    saveProgress(fresh);
  }, []);

  const dismissRecovered = useCallback(() => setRecovered(false), []);

  return {
    progress,
    ready,
    recovered,
    commit,
    recordOutcome,
    recordDailyRun,
    patchSettings,
    resetAll,
    dismissRecovered,
  };
}

export default usePersistentProgress;
