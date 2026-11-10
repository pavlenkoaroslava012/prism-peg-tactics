import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  HelpCircle,
  LayoutGrid,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react-native';
import assets from '../assets';
import BentoTile from '../components/BentoTile';
import RulesSheet from '../components/RulesSheet';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import { TOTAL_SHARDS } from '../constants/config';
import THEME from '../constants/theme';
import { routeDescriptor } from '../game/levelGen';

interface Props {
  activeRoute: number;
  solvedRoutes: number;
  bestRedirects: number | null;
  shards: number;
  onPlay: () => void;
  onChallenge: () => void;
  onDaily: () => void;
  onProgress: () => void;
  onCollection: () => void;
  onSettings: () => void;
}

/** Bento hub: one big PLAY tile plus the one-tap routes to every other screen. */
export function MenuScreen({
  activeRoute,
  solvedRoutes,
  bestRedirects,
  shards,
  onPlay,
  onChallenge,
  onDaily,
  onProgress,
  onCollection,
  onSettings,
}: Props) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  const openRules = useCallback(() => setRulesOpen(true), []);
  const closeRules = useCallback(() => setRulesOpen(false), []);

  const descriptor = routeDescriptor(activeRoute);
  const heroHint = descriptor.label + ' - PAR ' + descriptor.par;

  // Two values are needed for the stat column; otherwise one honest tile.
  const hasBest = bestRedirects !== null && bestRedirects > 0;
  const hasSolved = solvedRoutes > 0;
  const showStatPair = hasBest && hasSolved;

  return (
    <ScreenBackground overlay={THEME.gradients.menuOverlay}>
      <ScreenHeader
        title="PRISM PEG TACTICS"
        leftSlot={<Image source={assets.iconHome} style={styles.homeMark} resizeMode="contain" />}
        rightSlot={
          <View style={styles.badge}>
            <Sparkles size={16} color={THEME.colors.secondary} />
            <Text style={styles.badgeText}>{shards + '/' + TOTAL_SHARDS}</Text>
          </View>
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[styles.grid, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <View style={styles.rowA}>
          <BentoTile
            hero
            caption="PLAY NOW"
            hint={heroHint}
            Icon={Zap}
            accent={THEME.colors.white}
            height={190}
            onPress={onPlay}
            style={styles.flex2}
          />
          <View style={styles.statColumn}>
            {showStatPair ? (
              <>
                <BentoTile
                  caption="BEST ROUTE"
                  value={String(bestRedirects)}
                  Icon={Target}
                  accent={THEME.colors.secondary}
                  height={89}
                  size="sm"
                  onPress={onProgress}
                />
                <BentoTile
                  caption="SOLVED"
                  value={String(solvedRoutes)}
                  Icon={CheckCircle2}
                  accent={THEME.colors.tertiary}
                  height={89}
                  size="sm"
                  onPress={onProgress}
                />
              </>
            ) : (
              <BentoTile
                caption="NO RUNS YET"
                hint="SOLVE A ROUTE"
                Icon={Target}
                accent={THEME.colors.textSecondary}
                height={190}
                size="sm"
                onPress={onProgress}
              />
            )}
          </View>
        </View>

        <View style={styles.row}>
          <BentoTile
            caption="CHALLENGE"
            Icon={LayoutGrid}
            accent={THEME.colors.primary}
            height={78}
            size="sm"
            onPress={onChallenge}
            style={styles.flex1}
          />
          <BentoTile
            caption="DAILY MODE"
            Icon={CalendarDays}
            accent={THEME.colors.secondary}
            height={78}
            size="sm"
            onPress={onDaily}
            style={styles.flex1}
          />
          <BentoTile
            caption="PROGRESS"
            Icon={BarChart3}
            accent={THEME.colors.tertiary}
            height={78}
            size="sm"
            onPress={onProgress}
            style={styles.flex1}
          />
        </View>

        <View style={styles.row}>
          <BentoTile
            caption="COLLECTION"
            Icon={Sparkles}
            accent={THEME.colors.secondary}
            height={72}
            size="sm"
            onPress={onCollection}
            style={styles.flex1}
          />
          <BentoTile
            caption="SETTINGS"
            Icon={SettingsIcon}
            accent={THEME.colors.textSecondary}
            height={72}
            size="sm"
            onPress={onSettings}
            style={styles.flex1}
          />
        </View>

        <BentoTile
          caption="HOW TO PLAY"
          Icon={HelpCircle}
          accent={THEME.colors.primary}
          height={58}
          size="sm"
          onPress={openRules}
        />
      </Animated.View>

      <Text style={styles.footer}>OFFLINE - NO REAL MONEY - 12+</Text>

      <RulesSheet visible={rulesOpen} onClose={closeRules} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  homeMark: { width: 28, height: 28 },
  badge: {
    height: 40,
    minWidth: 76,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,212,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.35)',
  },
  badgeText: {
    color: THEME.colors.secondary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  grid: { flex: 1, padding: 16, gap: 12 },
  rowA: { flexDirection: 'row', gap: 12, height: 190 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  statColumn: { flex: 1, gap: 12 },
  footer: {
    textAlign: 'center',
    marginBottom: 12,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
});

export default MenuScreen;
