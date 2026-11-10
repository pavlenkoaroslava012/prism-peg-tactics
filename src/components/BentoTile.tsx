import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import THEME from '../constants/theme';
import type { IconComponent } from './icon';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

interface Props {
  caption: string;
  Icon: IconComponent;
  accent: string;
  onPress: () => void;
  size?: 'lg' | 'md' | 'sm';
  value?: string;
  hint?: string;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** The big PLAY tile: gradient fill plus the funnel sprite in the corner. */
  hero?: boolean;
}

export function BentoTile({
  caption,
  Icon,
  accent,
  onPress,
  size = 'md',
  value,
  hint,
  height,
  style,
  hero = false,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, ...THEME.spring.press }).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...THEME.spring.press }).start();
  }, [scale]);

  const iconSize = hero ? 30 : size === 'sm' ? 20 : 22;
  const captionStyle = hero ? styles.heroCaption : styles.caption;

  const body = (
    <View style={[styles.body, hero ? styles.heroBody : null]}>
      <Icon size={iconSize} color={hero ? THEME.colors.white : accent} />
      {value ? <Text style={[styles.value, { color: accent }]}>{value}</Text> : null}
      <Text style={captionStyle} numberOfLines={1}>
        {caption}
      </Text>
      {hint ? (
        <Text style={hero ? styles.heroHint : styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption}
      hitSlop={HIT}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[{ height }, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.tile, { height, transform: [{ scale }] }, hero ? THEME.glow(THEME.colors.primary) : null]}>
        {hero ? (
          <LinearGradient
            colors={THEME.gradients.play as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, { height, borderColor: THEME.colors.hudBorder }]}>
            <Image source={assets.spriteFunnel} style={styles.decor} resizeMode="contain" />
            {body}
          </LinearGradient>
        ) : (
          <View style={[styles.fill, styles.plain, { height }]}>
            <View style={[styles.dot, { backgroundColor: accent }]} />
            {body}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { width: '100%', borderRadius: THEME.radius.lg },
  fill: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  plain: {
    backgroundColor: THEME.colors.glass,
    borderColor: THEME.colors.border,
  },
  body: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  heroBody: { gap: 8 },
  // Positive offsets only: a sprite must never peek past the rounded corner.
  decor: { position: 'absolute', right: 10, bottom: 10, width: 44, height: 44, opacity: 0.35 },
  dot: { position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderRadius: 4 },
  caption: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroCaption: {
    color: THEME.colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroHint: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
});

export default React.memo(BentoTile);
