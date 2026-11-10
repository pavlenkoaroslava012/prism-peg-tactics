import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';
import HudFrame from './HudFrame';

interface Props {
  left: number;
  total: number;
  /** Increments on spend or refund and drives the pulse. */
  pulseKey: number;
  /** Increments when a placement was rejected and drives the shake. */
  rejectKey: number;
  reducedMotion: boolean;
}

export function RedirectMeter({ left, total, pulseKey, rejectKey, reducedMotion }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reducedMotion) {return;}
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  }, [pulseKey, scale, reducedMotion]);

  useEffect(() => {
    if (rejectKey === 0) {return;}
    Animated.sequence([
      Animated.timing(shake, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [rejectKey, shake]);

  const accent = left > 0 ? THEME.colors.secondary : THEME.colors.tertiary;

  return (
    <Animated.View pointerEvents="box-none" style={{ transform: [{ translateX: shake }] }}>
      <HudFrame accent={accent} brackets={2} bracketSize={12} style={styles.frame}>
        <View style={styles.inner}>
          <Animated.Text style={[styles.value, { color: accent, transform: [{ scale }] }]}>
            {left + '/' + total}
          </Animated.Text>
          <Text style={styles.label}>REDIRECTS</Text>
        </View>
      </HudFrame>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { minWidth: 86, backgroundColor: 'rgba(0,212,255,0.08)' },
  inner: { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  value: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: THEME.colors.textMuted,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default RedirectMeter;
