import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import THEME from '../constants/theme';
import StarRow from './StarRow';

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

export type RouteTileState = 'locked' | 'open' | 'cleared';

interface Props {
  index: number;
  par: number;
  stars: number;
  state: RouteTileState;
  onPress: (index: number) => void;
}

export function RouteTile({ index, par, stars, state, onPress }: Props) {
  const locked = state === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'ROUTE ' + (index + 1)}
      accessibilityState={{ disabled: locked }}
      hitSlop={HIT}
      disabled={locked}
      onPress={() => onPress(index)}
      style={styles.press}>
      <View
        style={[
          styles.tile,
          state === 'open' ? styles.open : null,
          state === 'cleared' ? styles.cleared : null,
          locked ? styles.locked : null,
        ]}>
        {locked ? (
          <Lock size={18} color={THEME.colors.textMuted} />
        ) : (
          <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
        )}
        <Text style={styles.par}>{'PAR ' + par}</Text>
        <StarRow earned={stars} size={12} accent={state === 'cleared' ? THEME.colors.primary : THEME.colors.secondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 100 },
  tile: {
    width: '100%',
    height: 100,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.glass,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  open: { borderColor: THEME.colors.hudBorder },
  cleared: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(139,0,255,0.14)',
  },
  locked: { opacity: 0.45 },
  number: {
    color: THEME.colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  par: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

export default React.memo(RouteTile);
