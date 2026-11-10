import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import THEME from '../constants/theme';

interface CornerProps {
  accent: string;
  size: number;
  position: 'tl' | 'tr' | 'bl' | 'br';
}

function Corner({ accent, size, position }: CornerProps) {
  const d =
    position === 'tl'
      ? `M1 ${size} L1 1 L${size} 1`
      : position === 'tr'
      ? `M0 1 L${size - 1} 1 L${size - 1} ${size}`
      : position === 'bl'
      ? `M1 0 L1 ${size - 1} L${size} ${size - 1}`
      : `M0 ${size - 1} L${size - 1} ${size - 1} L${size - 1} 0`;
  const style: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
    top: position === 'tl' || position === 'tr' ? 0 : undefined,
    bottom: position === 'bl' || position === 'br' ? 0 : undefined,
    left: position === 'tl' || position === 'bl' ? 0 : undefined,
    right: position === 'tr' || position === 'br' ? 0 : undefined,
  };
  return (
    <View style={style} pointerEvents="none">
      <Svg width={size} height={size}>
        <Path d={d} stroke={accent} strokeOpacity={0.25} strokeWidth={6} fill="none" />
        <Path d={d} stroke={accent} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}

interface Props {
  children?: React.ReactNode;
  accent?: string;
  brackets?: 2 | 4;
  bracketSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The bracketed surface that is the project's single repeated signature:
 * board frame, verdict card, stat bands and the loader logo frame.
 */
export function HudFrame({
  children,
  accent = THEME.colors.secondary,
  brackets = 4,
  bracketSize = 20,
  style,
}: Props) {
  return (
    <View style={[styles.base, style]}>
      {children}
      <Corner accent={accent} size={bracketSize} position="tl" />
      <Corner accent={accent} size={bracketSize} position="br" />
      {brackets === 4 ? (
        <>
          <Corner accent={accent} size={bracketSize} position="tr" />
          <Corner accent={accent} size={bracketSize} position="bl" />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.glass,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
});

export default HudFrame;
