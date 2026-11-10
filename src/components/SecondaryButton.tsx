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
import assets from '../assets';
import THEME from '../constants/theme';
import type { IconComponent } from './icon';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const ICON = 24;
const SQUARE = 56;

interface Props {
  label?: string;
  onPress: () => void;
  Icon?: IconComponent;
  disabled?: boolean;
  square?: boolean;
  badge?: string;
  accent?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SecondaryButton({
  label,
  onPress,
  Icon,
  disabled = false,
  square = false,
  badge,
  accent = THEME.colors.secondary,
  height = 48,
  style,
  testID,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, ...THEME.spring.press }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...THEME.spring.press }).start();
  }, [scale]);

  const box: ViewStyle = square
    ? { width: SQUARE, height: SQUARE }
    : { width: '100%', height };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? badge ?? 'action'}
      accessibilityState={{ disabled }}
      testID={testID}
      hitSlop={HIT}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[box, disabled ? styles.disabled : null, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          box,
          { borderColor: disabled ? THEME.colors.border : accent + '66', transform: [{ scale }] },
        ]}>
        {square ? (
          <Image source={assets.buttonRound} style={styles.plate} resizeMode="contain" />
        ) : null}
        <View style={[styles.row, badge ? styles.rowWithBadge : null]}>
          {Icon ? <Icon size={ICON} color={disabled ? THEME.colors.textMuted : accent} /> : null}
          {label ? (
            <Text style={[styles.label, { color: disabled ? THEME.colors.textMuted : accent }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
        {badge ? (
          <Text style={[styles.badge, { color: disabled ? THEME.colors.textMuted : accent }]}>{badge}</Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.35 },
  fill: {
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plate: {
    position: 'absolute',
    width: SQUARE - 8,
    height: SQUARE - 8,
    opacity: 0.18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  // Lifts the icon so the count underneath it never touches the glyph.
  rowWithBadge: { marginBottom: 14 },
  label: {
    fontSize: 14,
    lineHeight: ICON,
    fontWeight: '700',
    letterSpacing: 2,
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
});

export default SecondaryButton;
