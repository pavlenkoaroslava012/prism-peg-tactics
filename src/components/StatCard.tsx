import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';
import type { IconComponent } from './icon';

export interface StatItem {
  key: string;
  value: string | number;
  label: string;
  accent: string;
}

interface Props extends StatItem {
  Icon?: IconComponent;
}

/**
 * One pill. Every pill in a row uses the SAME icon component and is told
 * apart by colour, value and label — three different sprites would never
 * read as one uniform row.
 *
 * Returns null for an empty or zero value so an empty rounded box can never
 * reach the screen.
 */
export function StatCard({ value, label, accent, Icon }: Props) {
  if (value === '' || value === null || value === undefined) {return null;}
  if (typeof value === 'number' && value === 0) {return null;}

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
        {Icon ? <Icon size={24} color={accent} /> : null}
      </View>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {String(value)}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width:'100%' and NOT flex:1 — the parent slot already owns the width,
  // a second flex:1 would collapse this card to a few pixels tall.
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.glass,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: 8,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 2,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});

export default StatCard;
