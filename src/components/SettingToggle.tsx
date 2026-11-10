import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const TRACK_W = 52;
const KNOB = 22;

interface ToggleProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (next: boolean) => void;
}

export function SettingToggle({ label, hint, value, onChange }: ToggleProps) {
  const knob = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(knob, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [value, knob]);

  const translateX = knob.interpolate({ inputRange: [0, 1], outputRange: [3, TRACK_W - KNOB - 3] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={HIT}
      onPress={() => onChange(!value)}
      style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <View style={[styles.track, value ? styles.trackOn : null]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.knob, { backgroundColor: value ? THEME.colors.secondary : THEME.colors.textMuted, transform: [{ translateX }] }]}
        />
      </View>
    </Pressable>
  );
}

interface ChipsProps {
  label: string;
  hint: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}

export function SettingChips({ label, hint, options, value, onChange }: ChipsProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.chips}>
        {options.map(option => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={option}
              accessibilityState={{ selected: active }}
              hitSlop={HIT}
              onPress={() => onChange(option)}
              style={[styles.chip, active ? styles.chipActive : null]}>
              <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  block: { width: '100%', paddingVertical: 8 },
  texts: { flex: 1, paddingRight: 12 },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  hint: {
    marginTop: 2,
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  track: {
    width: TRACK_W,
    height: KNOB + 6,
    borderRadius: (KNOB + 6) / 2,
    backgroundColor: THEME.colors.track,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: 'rgba(0,212,255,0.18)', borderColor: THEME.colors.hudBorder },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: { backgroundColor: 'rgba(0,212,255,0.14)', borderColor: THEME.colors.hudBorder },
  chipText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  chipTextActive: { color: THEME.colors.secondary },
});

export default SettingToggle;
