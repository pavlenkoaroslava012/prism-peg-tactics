import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { BOARD_H, BOARD_W } from '../constants/config';
import THEME, { type TintKey } from '../constants/theme';

interface Props {
  points: Array<{ x: number; y: number }>;
  visible: boolean;
  tint: TintKey | null;
  /** With ROUTE PREVIEW off only the landing lane is revealed. */
  landingOnly: boolean;
}

/** The dashed scan polyline. Only opacity animates, so the native driver is safe. */
export function GhostRoute({ points, visible, tint, landingOnly }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (points.length < 2) {return null;}

  const shown = landingOnly ? points.slice(points.length - 2) : points;
  const color = tint === null ? THEME.colors.secondary : THEME.tints[tint];

  return (
    <Animated.View pointerEvents="none" style={[styles.layer, { opacity }]}>
      <Svg width={BOARD_W} height={BOARD_H}>
        <Polyline
          points={shown.map(p => p.x + ',' + p.y).join(' ')}
          fill="none"
          stroke={color}
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeDasharray="6,5"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0, width: BOARD_W, height: BOARD_H },
});

export default GhostRoute;
