import { useMemo } from 'react';
import { DROP_SPEEDS } from '../constants/config';
import type { Settings } from '../storage/progressStore';

export interface DerivedSettings {
  dropStepMs: number;
  showBiasMarkers: boolean;
  showGhostRoute: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  trailLength: number;
}

/** Turns the stored flags into the values the renderer actually consumes. */
export function useSettings(settings: Settings): DerivedSettings {
  return useMemo(
    () => ({
      dropStepMs: settings.reducedMotion
        ? Math.min(90, DROP_SPEEDS[settings.dropSpeed])
        : DROP_SPEEDS[settings.dropSpeed],
      showBiasMarkers: settings.biasMarkers,
      showGhostRoute: settings.routePreview,
      highContrast: settings.highContrast,
      reducedMotion: settings.reducedMotion,
      trailLength: settings.reducedMotion ? 0 : 6,
    }),
    [settings],
  );
}

export default useSettings;
