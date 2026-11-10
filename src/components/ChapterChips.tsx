import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

interface Props {
  chapters: readonly string[];
  activeIndex: number;
  unlockedCount: number;
  onSelect: (index: number) => void;
}

export function ChapterChips({ chapters, activeIndex, unlockedCount, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {chapters.map((name, i) => {
        const active = i === activeIndex;
        const locked = i >= unlockedCount;
        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityState={{ selected: active, disabled: locked }}
            hitSlop={HIT}
            disabled={locked}
            onPress={() => onSelect(i)}
            style={[
              styles.chip,
              active ? styles.chipActive : null,
              locked ? styles.chipLocked : null,
            ]}>
            <Text
              style={[styles.text, active ? styles.textActive : null]}
              numberOfLines={1}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(139,0,255,0.18)',
    borderColor: THEME.colors.primary,
  },
  chipLocked: { opacity: 0.4 },
  text: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  textActive: { color: THEME.colors.textPrimary },
});

export default ChapterChips;
