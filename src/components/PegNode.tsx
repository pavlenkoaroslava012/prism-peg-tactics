import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import assets from '../assets';
import { GATE_SIZE, PEG_SIZE, TILE } from '../constants/config';
import THEME, { type TintKey } from '../constants/theme';
import type { GateState } from '../game/boardSim';

const HIT = { top: 6, bottom: 6, left: 4, right: 4 };
const ROTATIONS = ['0deg', '120deg', '240deg'];

interface Props {
  row: number;
  col: number;
  bias: -1 | 1;
  tint: TintKey | null;
  charged: boolean;
  gate: GateState | undefined;
  showMarkers: boolean;
  dim: boolean;
  disabled: boolean;
  onPress: (row: number, col: number) => void;
}

/**
 * One peg. The bias marker is a drawn triangle, never a text glyph: a
 * chevron character renders as a colon or tofu on Android.
 */
function PegNodeBase({ row, col, bias, tint, charged, gate, showMarkers, dim, disabled, onPress }: Props) {
  const spin = useRef(new Animated.Value(gate === undefined ? 0 : gate)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (gate === undefined) {
      spin.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(spin, {
        toValue: gate,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.1, duration: 110, useNativeDriver: true }),
        Animated.timing(pop, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
    ]).start();
  }, [gate, spin, pop]);

  const rotate = spin.interpolate({ inputRange: [0, 1, 2], outputRange: ROTATIONS });
  const tintColor = tint === null ? null : THEME.tints[tint];
  const coreColor = charged ? THEME.colors.secondary : tintColor ?? THEME.colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'PEG ROW ' + (row + 1) + ' LANE ' + (col + 1)}
      hitSlop={HIT}
      disabled={disabled}
      onPress={() => onPress(row, col)}
      style={styles.slot}>
      <View style={[styles.centre, dim ? styles.dim : null]}>
        <View
          style={[
            styles.hex,
            {
              borderColor: charged ? THEME.colors.secondary : 'rgba(242,234,255,0.35)',
              backgroundColor: charged ? 'rgba(0,212,255,0.22)' : 'transparent',
            },
            tintColor !== null && !charged ? { borderColor: tintColor } : null,
          ]}
        />
        {/* A prism node shows its core from the start; a charged peg lights it. */}
        {charged || tintColor !== null ? (
          <Image
            source={assets.spriteCore}
            style={[styles.core, charged ? null : styles.coreIdle]}
            resizeMode="contain"
          />
        ) : null}
        {showMarkers && gate === undefined ? (
          <View
            style={[
              styles.marker,
              bias === 1 ? styles.markerRight : styles.markerLeft,
              bias === 1
                ? { borderLeftColor: coreColor }
                : { borderRightColor: coreColor },
            ]}
          />
        ) : null}
        {gate !== undefined ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.gate, { transform: [{ rotate }, { scale: pop }] }]}>
            <Image source={assets.spriteGate} style={styles.gateImage} resizeMode="contain" />
          </Animated.View>
        ) : null}
      </View>
    </Pressable>
  );
}

const MARKER_H = 4;
const MARKER_W = 7;

const styles = StyleSheet.create({
  slot: { width: TILE, height: TILE, alignItems: 'center', justifyContent: 'center' },
  centre: { width: TILE, height: TILE, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.7 },
  hex: {
    width: PEG_SIZE,
    height: PEG_SIZE,
    borderWidth: 1.5,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  core: { position: 'absolute', width: 12, height: 12 },
  coreIdle: { opacity: 0.55 },
  marker: {
    position: 'absolute',
    bottom: 3,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: MARKER_H,
    borderBottomWidth: MARKER_H,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  markerRight: { right: 2, borderLeftWidth: MARKER_W, borderRightWidth: 0 },
  markerLeft: { left: 2, borderRightWidth: MARKER_W, borderLeftWidth: 0 },
  gate: { position: 'absolute', width: GATE_SIZE, height: GATE_SIZE },
  gateImage: { width: GATE_SIZE, height: GATE_SIZE },
});

export const PegNode = React.memo(PegNodeBase);
export default PegNode;
