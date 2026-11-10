import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Target, Zap } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import EmptyState from '../components/EmptyState';
import HudFrame from '../components/HudFrame';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import StatRow from '../components/StatRow';
import { CHAPTER_NAMES, ROUTES_PER_CHAPTER, TOTAL_STARS } from '../constants/config';
import THEME from '../constants/theme';
import { routeDescriptor } from '../game/levelGen';
import { averageRedirects } from '../game/scoring';
import type { RouteRecord } from '../storage/progressStore';

interface Props {
  routes: RouteRecord[];
  onPlay: () => void;
  onBack: () => void;
}

export function ProgressScreen({ routes, onPlay, onBack }: Props) {
  const stars = useMemo(() => routes.reduce((sum, r) => sum + r.stars, 0), [routes]);
  const solved = useMemo(() => routes.filter(r => r.cleared).length, [routes]);
  const oneShots = useMemo(() => routes.filter(r => r.oneShot).length, [routes]);
  const avg = useMemo(() => averageRedirects(routes.map(r => r.bestRedirects)), [routes]);
  const atPar = useMemo(
    () =>
      routes.filter(
        (r, i) => r.cleared && r.bestRedirects !== null && r.bestRedirects <= routeDescriptor(i).par,
      ).length,
    [routes],
  );

  const chapters = useMemo(
    () =>
      CHAPTER_NAMES.map((name, c) => {
        const slice = routes.slice(c * ROUTES_PER_CHAPTER, (c + 1) * ROUTES_PER_CHAPTER);
        const cleared = slice.filter(r => r.cleared).length;
        return { name, cleared, total: ROUTES_PER_CHAPTER, ratio: cleared / ROUTES_PER_CHAPTER };
      }),
    [routes],
  );

  return (
    <ScreenBackground>
      <ScreenHeader title="PROGRESS" subtitle="SPECTRUM RECORD" onBack={onBack} />

      <View style={styles.body}>
        <HudFrame accent={THEME.colors.secondary} style={styles.hero}>
          <View style={styles.heroInner}>
            <Text style={styles.heroValue}>{stars + '/' + TOTAL_STARS}</Text>
            <Text style={styles.heroLabel}>SPECTRUM STARS</Text>
          </View>
        </HudFrame>

        {solved === 0 ? (
          <EmptyState
            title="NO ROUTES SOLVED YET"
            hint="Every solved route adds stars here and unlocks the next board. Start with route one."
            actionLabel="PLAY NOW"
            onAction={onPlay}
            ActionIcon={Zap}
          />
        ) : (
          <>
            <View style={styles.bars}>
              {chapters.map(chapter => (
                <View key={chapter.name} style={styles.barRow}>
                  <Image source={assets.spriteCore} style={styles.bullet} resizeMode="contain" />
                  <Text style={styles.barName} numberOfLines={1}>
                    {chapter.name}
                  </Text>
                  <View style={styles.track}>
                    <LinearGradient
                      colors={THEME.gradients.beam as unknown as string[]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flex: chapter.ratio }}
                    />
                    <View style={{ flex: 1 - chapter.ratio }} />
                  </View>
                  <Text style={styles.barCount}>{chapter.cleared + '/' + chapter.total}</Text>
                </View>
              ))}
            </View>

            <StatRow
              Icon={Target}
              items={[
                {
                  key: 'solved',
                  value: solved,
                  label: 'ROUTES SOLVED',
                  accent: THEME.colors.secondary,
                },
                {
                  key: 'avg',
                  value: avg,
                  label: 'AVG REDIRECTS',
                  accent: THEME.colors.primary,
                },
                {
                  key: 'oneshot',
                  value: oneShots,
                  label: 'ONE-SHOTS',
                  accent: THEME.colors.tertiary,
                },
              ]}
            />

            <Text style={styles.efficiency}>
              {'FEWEST-REDIRECT SOLVES: ' + atPar + ' OF ' + solved}
            </Text>
          </>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 16 },
  hero: { backgroundColor: 'rgba(0,212,255,0.07)' },
  heroInner: { paddingVertical: 18, alignItems: 'center' },
  heroValue: {
    color: THEME.colors.secondary,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  heroLabel: {
    marginTop: 4,
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 3,
  },
  bars: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 26 },
  bullet: { width: 10, height: 10 },
  barName: {
    width: 86,
    color: THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: THEME.colors.track,
  },
  barCount: {
    width: 34,
    textAlign: 'right',
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  efficiency: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
});

export default ProgressScreen;
