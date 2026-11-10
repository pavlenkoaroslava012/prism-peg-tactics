import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Target } from 'lucide-react-native';
import assets from '../assets';
import HudFrame from '../components/HudFrame';
import PrimaryButton from '../components/PrimaryButton';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarRow from '../components/StarRow';
import StatRow from '../components/StatRow';
import THEME, { TINT_LABEL } from '../constants/theme';
import { verdictLine, verdictTitle } from '../game/scoring';
import { SHARDS } from '../game/shards';
import type { RoundResult } from '../hooks/useRouteEngine';

interface Props {
  result: RoundResult;
  bestRedirects: number | null;
  shardUnlocked: number | null;
  reducedMotion: boolean;
  hasNextRoute: boolean;
  onAgain: () => void;
  onNextRoute: () => void;
  onMenu: () => void;
}

export function ResultScreen({
  result,
  bestRedirects,
  shardUnlocked,
  reducedMotion,
  hasNextRoute,
  onAgain,
  onNextRoute,
  onMenu,
}: Props) {
  const enter = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const reward = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      enter.setValue(1);
      reward.setValue(1);
      return;
    }
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, ...THEME.spring.card }).start();
    if (result.solved) {
      Animated.spring(reward, {
        toValue: 1,
        delay: 420,
        useNativeDriver: true,
        ...THEME.spring.card,
      }).start();
    } else {
      Animated.sequence([
        Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [enter, reward, shake, reducedMotion, result.solved]);

  const accent = result.solved ? THEME.colors.secondary : THEME.colors.tertiary;
  const tintNote =
    result.requiredTint === null
      ? 'NO TINT REQUIRED'
      : 'REQUIRED TINT ' + TINT_LABEL[result.requiredTint];
  const shard = shardUnlocked === null ? null : SHARDS[shardUnlocked];

  return (
    <ScreenBackground overlay={THEME.gradients.resultOverlay} blobs={false}>
      <ScreenHeader
        title="ROUTE RESULT"
        subtitle={'ROUTE ' + String(result.routeIndex + 1).padStart(2, '0')}
        rightSlot={
          <Text style={[styles.par, { color: accent }]}>{'PAR ' + result.par}</Text>
        }
      />

      <View style={styles.body}>
        <View style={[styles.glow, { backgroundColor: accent }]} pointerEvents="none" />

        <Animated.View
          pointerEvents="box-none"
          style={{
            transform: [
              { translateX: shake },
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            ],
            opacity: enter,
          }}>
          <HudFrame accent={accent} style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={[styles.verdict, { color: accent, textShadowColor: accent }]}>
                {verdictTitle(result.solved)}
              </Text>
              <Text style={styles.subline}>{verdictLine(result.landedLane, result.targetLane)}</Text>
              <Text style={styles.tintNote}>{tintNote}</Text>

              <View style={styles.stars}>
                <StarRow earned={result.stars} size={26} accent={accent} />
              </View>

              <StatRow
                Icon={Target}
                items={[
                  {
                    key: 'redirects',
                    value: result.redirectsUsed,
                    label: 'REDIRECTS',
                    accent: THEME.colors.secondary,
                  },
                  {
                    key: 'pegs',
                    value: result.pegsLit,
                    label: 'PEGS LIT',
                    accent: THEME.colors.primary,
                  },
                  {
                    key: 'best',
                    value: bestRedirects === null ? 0 : bestRedirects,
                    label: 'BEST',
                    accent: THEME.colors.tertiary,
                  },
                ]}
              />

              {result.refunded ? (
                <Text style={styles.refund}>CHARGE QUOTA MET - ONE REDIRECT REFUNDED</Text>
              ) : null}
              {result.blind ? <Text style={styles.refund}>BLIND SOLVE - PREVIEW WAS OFF</Text> : null}

              {shard !== null ? (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.rewardRow, { transform: [{ scale: reward }], opacity: reward }]}>
                  <Image source={assets.spriteShard} style={styles.shard} resizeMode="contain" />
                  <Text style={styles.rewardText}>{'SHARD UNLOCKED - ' + shard.name}</Text>
                </Animated.View>
              ) : null}
            </View>
          </HudFrame>
        </Animated.View>

        <View style={styles.actions}>
          <PrimaryButton label="DROP AGAIN" onPress={onAgain} height={58} />
          {result.solved && hasNextRoute ? (
            <SecondaryButton label="NEXT ROUTE" onPress={onNextRoute} height={48} />
          ) : null}
          <SecondaryButton
            label="MENU"
            onPress={onMenu}
            height={48}
            accent={THEME.colors.textSecondary}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.16,
  },
  par: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  card: { width: 320, maxWidth: '100%', backgroundColor: 'rgba(26,0,56,0.80)' },
  cardInner: { padding: 20, alignItems: 'center' },
  verdict: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  subline: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 1,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  tintNote: {
    marginTop: 4,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  stars: { marginVertical: 14 },
  refund: {
    marginTop: 10,
    color: THEME.colors.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  rewardRow: { marginTop: 14, alignItems: 'center', gap: 6 },
  shard: { width: 40, height: 40 },
  rewardText: {
    color: THEME.colors.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  actions: { marginTop: 22, width: '100%', maxWidth: 320, gap: 12 },
});

export default ResultScreen;
