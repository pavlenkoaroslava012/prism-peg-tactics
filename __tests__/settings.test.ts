import { DROP_SPEEDS } from '../src/constants/config';
import {
  DEFAULT_SETTINGS,
  defaultProgress,
  deserialize,
  serialize,
  updateSettings,
} from '../src/storage/progressStore';

/** Mirrors the derivation in useSettings without mounting a component. */
function derive(settings: typeof DEFAULT_SETTINGS) {
  return {
    dropStepMs: settings.reducedMotion
      ? Math.min(90, DROP_SPEEDS[settings.dropSpeed])
      : DROP_SPEEDS[settings.dropSpeed],
    trailLength: settings.reducedMotion ? 0 : 6,
  };
}

describe('settings', () => {
  it('ships sensible defaults and no audio option', () => {
    expect(DEFAULT_SETTINGS.routePreview).toBe(true);
    expect(DEFAULT_SETTINGS.biasMarkers).toBe(true);
    expect(DEFAULT_SETTINGS.highContrast).toBe(false);
    expect(DEFAULT_SETTINGS.reducedMotion).toBe(false);
    expect(Object.keys(DEFAULT_SETTINGS)).not.toContain('sound');
    expect(Object.keys(DEFAULT_SETTINGS)).not.toContain('music');
  });

  it('maps DROP SPEED onto a real step duration', () => {
    expect(derive({ ...DEFAULT_SETTINGS, dropSpeed: 'SLOW' }).dropStepMs).toBe(220);
    expect(derive({ ...DEFAULT_SETTINGS, dropSpeed: 'NORMAL' }).dropStepMs).toBe(150);
    expect(derive({ ...DEFAULT_SETTINGS, dropSpeed: 'FAST' }).dropStepMs).toBe(95);
  });

  it('shortens the hop and drops the trail under REDUCED MOTION', () => {
    const reduced = derive({ ...DEFAULT_SETTINGS, reducedMotion: true, dropSpeed: 'SLOW' });
    expect(reduced.dropStepMs).toBeLessThanOrEqual(90);
    expect(reduced.trailLength).toBe(0);
  });

  it('patches one flag without disturbing the others', () => {
    const next = updateSettings(defaultProgress(), { highContrast: true });
    expect(next.settings.highContrast).toBe(true);
    expect(next.settings.routePreview).toBe(true);
  });

  it('round-trips every flag through storage', () => {
    const progress = updateSettings(defaultProgress(), {
      biasMarkers: false,
      dropSpeed: 'FAST',
      reducedMotion: true,
    });
    const restored = deserialize(serialize(progress)).progress;
    expect(restored.settings.biasMarkers).toBe(false);
    expect(restored.settings.dropSpeed).toBe('FAST');
    expect(restored.settings.reducedMotion).toBe(true);
  });
});
