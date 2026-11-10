import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import ConfirmSheet from '../components/ConfirmSheet';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { SettingChips, SettingToggle } from '../components/SettingToggle';
import THEME from '../constants/theme';
import type { DropSpeed } from '../constants/config';
import type { Settings } from '../storage/progressStore';

const SPEEDS: DropSpeed[] = ['SLOW', 'NORMAL', 'FAST'];

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onBack: () => void;
}

/** Every option changes real behaviour. There are no audio options, because
 *  the app has no audio. */
export function SettingsScreen({ settings, onChange, onReset, onBack }: Props) {
  const [confirming, setConfirming] = useState(false);

  const askReset = useCallback(() => setConfirming(true), []);
  const cancelReset = useCallback(() => setConfirming(false), []);
  const confirmReset = useCallback(() => {
    setConfirming(false);
    onReset();
  }, [onReset]);

  return (
    <ScreenBackground>
      <ScreenHeader title="SETTINGS" subtitle="BOARD AND MOTION" onBack={onBack} />

      <View style={styles.body}>
        <SettingToggle
          label="ROUTE PREVIEW"
          hint="A Route Scan draws the full dashed ghost route. Off reveals only the landing lane and flags the solve BLIND."
          value={settings.routePreview}
          onChange={next => onChange({ routePreview: next })}
        />
        <View style={styles.divider} />

        <SettingToggle
          label="PEG BIAS MARKERS"
          hint="Draws the left and right bias triangles on every peg. Off is expert reading mode."
          value={settings.biasMarkers}
          onChange={next => onChange({ biasMarkers: next })}
        />
        <View style={styles.divider} />

        <SettingToggle
          label="HIGH CONTRAST SLOTS"
          hint="Raises slot fills, slot text and borders for easier reading of the target lane."
          value={settings.highContrast}
          onChange={next => onChange({ highContrast: next })}
        />
        <View style={styles.divider} />

        <SettingToggle
          label="REDUCED MOTION"
          hint="Shortens the drop hop, removes the trail and replaces the win pulse with a static lit frame."
          value={settings.reducedMotion}
          onChange={next => onChange({ reducedMotion: next })}
        />
        <View style={styles.divider} />

        <SettingChips
          label="DROP SPEED"
          hint="Sets how long the orb takes between peg rows."
          options={SPEEDS}
          value={settings.dropSpeed}
          onChange={next => onChange({ dropSpeed: next as DropSpeed })}
        />

        <View style={styles.reset}>
          <SecondaryButton
            label="RESET PROGRESS"
            Icon={Trash2}
            accent={THEME.colors.tertiary}
            onPress={askReset}
            height={52}
          />
        </View>

        <Text style={styles.footer}>PRISM PEG TACTICS - OFFLINE - NO REAL MONEY</Text>
      </View>

      <ConfirmSheet
        visible={confirming}
        title="RESET PROGRESS"
        body="Routes, stars, shards and daily history will be cleared. This cannot be undone."
        confirmLabel="RESET"
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  divider: { height: 1, backgroundColor: THEME.colors.hairline, opacity: 0.6 },
  reset: { marginTop: 18 },
  footer: {
    marginTop: 'auto',
    marginBottom: 14,
    textAlign: 'center',
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
});

export default SettingsScreen;
