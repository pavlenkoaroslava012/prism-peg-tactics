import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, RotateCcw } from 'lucide-react-native';
import HudFrame from '../components/HudFrame';
import PegBoard from '../components/PegBoard';
import PrimaryButton from '../components/PrimaryButton';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { DAILY_SCANS } from '../constants/config';
import THEME from '../constants/theme';
import { generateLayout, routeDescriptor } from '../game/levelGen';
import type { DailyEntry } from '../storage/progressStore';

const NOOP = () => {};

interface Props {
  routeIndex: number;
  seed: number;
  dateLabel: string;
  countdown: string;
  played: DailyEntry | null;
  history: Array<{ day: number; state: 'solved' | 'missed' | 'none' }>;
  highContrast: boolean;
  onStart: () => void;
  onBack: () => void;
}

export function DailyModeScreen({
  routeIndex,
  seed,
  dateLabel,
  countdown,
  played,
  history,
  highContrast,
  onStart,
  onBack,
}: Props) {
  const descriptor = useMemo(() => routeDescriptor(routeIndex), [routeIndex]);
  const layout = useMemo(() => generateLayout(routeIndex, seed), [routeIndex, seed]);

  return (
    <ScreenBackground>
      <ScreenHeader title="DAILY MODE" subtitle="ONE BOARD PER DAY" onBack={onBack} />

      <View style={styles.body}>
        <HudFrame accent={THEME.colors.secondary} style={styles.card}>
          <View style={styles.cardInner}>
            <View>
              <Text style={styles.cardLabel}>DAILY ROUTE</Text>
              <Text style={styles.date}>{dateLabel}</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>NEXT IN</Text>
              <Text style={styles.countdown}>{countdown}</Text>
            </View>
          </View>
        </HudFrame>

        <Text style={styles.rules}>
          {DAILY_SCANS + ' SCAN - PAR ' + descriptor.par + ' - ONE RECORDED RUN'}
        </Text>

        <View style={styles.preview}>
          <PegBoard
            layout={layout}
            gates={{}}
            chargedIds={[]}
            showMarkers
            highContrast={highContrast}
            reducedMotion
            landedIndex={null}
            landedSolved={false}
            dim={false}
            disabled
            onPegPress={NOOP}
            scale={0.55}
          />
        </View>

        <View style={styles.history}>
          {history.map(entry => (
            <View
              key={entry.day}
              style={[
                styles.dot,
                entry.state === 'solved' ? styles.dotSolved : null,
                entry.state === 'missed' ? styles.dotMissed : null,
              ]}
            />
          ))}
        </View>

        {played !== null ? (
          <Text style={styles.recorded}>{'TODAY RECORDED: ' + played.redirects + ' REDIRECTS'}</Text>
        ) : null}

        <View style={styles.action}>
          {played === null ? (
            <PrimaryButton label="START DAILY" Icon={CalendarDays} onPress={onStart} height={58} />
          ) : (
            <SecondaryButton label="PRACTICE AGAIN" Icon={RotateCcw} onPress={onStart} height={58} />
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 12, alignItems: 'center' },
  card: { width: '100%', backgroundColor: 'rgba(0,212,255,0.06)' },
  cardInner: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  date: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  countdownBox: { alignItems: 'flex-end' },
  countdownLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  countdown: {
    color: THEME.colors.secondary,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  rules: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  preview: { alignItems: 'center', justifyContent: 'center' },
  history: { flexDirection: 'row', gap: 8, marginTop: 2 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dotSolved: { backgroundColor: THEME.colors.secondary },
  dotMissed: { backgroundColor: THEME.colors.tertiary },
  recorded: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  // The hint sits ABOVE the CTA, never below it.
  action: { width: '100%', maxWidth: 320, marginTop: 4 },
});

export default DailyModeScreen;
