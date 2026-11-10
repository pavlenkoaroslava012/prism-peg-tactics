import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LANES, SLOT_H, TILE } from '../constants/config';
import THEME, { type TintKey } from '../constants/theme';

interface Props {
  targetIndex: number;
  requiredTint: TintKey | null;
  highContrast: boolean;
  landedIndex: number | null;
  landedSolved: boolean;
  reducedMotion: boolean;
}

export function SlotRow({
  targetIndex,
  requiredTint,
  highContrast,
  landedIndex,
  landedSolved,
  reducedMotion,
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (landedIndex === null) {
      pulse.setValue(0);
      return;
    }
    if (reducedMotion) {
      pulse.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.55, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [landedIndex, pulse, reducedMotion]);

  const tintColor = requiredTint === null ? THEME.colors.secondary : THEME.tints[requiredTint];

  return (
    <View style={styles.row}>
      {Array.from({ length: LANES }, (_, i) => {
        const isTarget = i === targetIndex;
        const isLanded = landedIndex === i;
        if (isTarget) {
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[styles.slot, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}>
              <LinearGradient
                colors={THEME.gradients.beam as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.fill, highContrast ? styles.fillContrast : null]}>
                <View style={[styles.topEdge, { backgroundColor: tintColor }]} />
                <View style={[styles.tintDot, { backgroundColor: tintColor }]} />
                <Text style={[styles.index, styles.indexTarget]}>{i + 1}</Text>
              </LinearGradient>
            </Animated.View>
          );
        }
        return (
          <View
            key={i}
            style={[
              styles.slot,
              styles.idle,
              highContrast ? styles.idleContrast : null,
              isLanded ? { borderColor: landedSolved ? THEME.colors.secondary : THEME.colors.tertiary } : null,
            ]}>
            <Text style={[styles.index, highContrast ? styles.indexContrast : null]}>{i + 1}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', height: SLOT_H },
  slot: { width: TILE, height: SLOT_H, alignItems: 'center', justifyContent: 'center' },
  idle: {
    backgroundColor: THEME.colors.slotIdle,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.18)',
  },
  idleContrast: {
    backgroundColor: 'rgba(13,27,42,0.90)',
    borderWidth: 2,
  },
  fill: { width: TILE, height: SLOT_H, alignItems: 'center', justifyContent: 'center' },
  fillContrast: { borderWidth: 2, borderColor: THEME.colors.white },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  tintDot: { position: 'absolute', top: 7, width: 6, height: 6, borderRadius: 3 },
  index: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  indexContrast: { color: THEME.colors.white },
  indexTarget: { color: THEME.colors.white, marginTop: 8 },
});

export default React.memo(SlotRow);
