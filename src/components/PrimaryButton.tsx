import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import THEME from '../constants/theme';
import type { IconComponent } from './icon';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const ICON = 24;

interface Props {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  disabled?: boolean;
  height?: number;
  colors?: readonly string[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Pressable is the PARENT and the Animated.View is its CHILD — the press
 * scale can never swallow the tap this way.
 */
export function PrimaryButton({
  label,
  onPress,
  Icon,
  disabled = false,
  height = 58,
  colors = THEME.gradients.beam,
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      hitSlop={HIT}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.press, { height }, disabled ? styles.disabled : null, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, { height, transform: [{ scale }] }]}>
        <LinearGradient
          colors={colors as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { height }]}>
          <View style={styles.row}>
            {Icon ? <Icon size={ICON} color={THEME.colors.white} /> : null}
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    ...THEME.glow(THEME.colors.primary),
  },
  disabled: { opacity: 0.4 },
  fill: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    color: THEME.colors.white,
    fontSize: 18,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 3,
  },
});

export default PrimaryButton;
