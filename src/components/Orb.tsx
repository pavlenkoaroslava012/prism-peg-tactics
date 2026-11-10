import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import assets from '../assets';
import { ORB_SIZE } from '../constants/config';
import THEME, { type TintKey } from '../constants/theme';

const HALO = ORB_SIZE + 12;

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
}

interface Props {
  translateX: Animated.Value;
  translateY: Animated.Value;
  squash: Animated.Value;
  tint: TintKey | null;
  trail: TrailDot[];
}

export function Orb({ translateX, translateY, squash, tint, trail }: Props) {
  const color = tint === null ? THEME.colors.secondary : THEME.tints[tint];

  return (
    <>
      {trail.map((dot, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.trailDot,
            { left: dot.x - 2, top: dot.y - 2, backgroundColor: color, opacity: dot.opacity },
          ]}
        />
      ))}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.wrap,
          {
            transform: [
              { translateX },
              { translateY },
              { scaleY: squash },
            ],
          },
        ]}>
        <Svg width={HALO} height={HALO} style={styles.halo}>
          <Circle cx={HALO / 2} cy={HALO / 2} r={HALO / 2 - 2} stroke={color} strokeWidth={2} fill="none" opacity={0.75} />
        </Svg>
        <Image source={assets.spriteOrb} style={styles.sprite} resizeMode="contain" />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: -HALO / 2,
    top: -HALO / 2,
    width: HALO,
    height: HALO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: { position: 'absolute' },
  sprite: { width: ORB_SIZE, height: ORB_SIZE },
  trailDot: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
});

export default Orb;
