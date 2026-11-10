import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import assets from '../assets';
import THEME from '../constants/theme';
import HudFrame from './HudFrame';
import PrimaryButton from './PrimaryButton';
import type { IconComponent } from './icon';

interface Props {
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
  ActionIcon?: IconComponent;
  accent?: string;
}

/** Themed block for every empty or recoverable-error state. Never a blank area. */
export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
  ActionIcon,
  accent = THEME.colors.secondary,
}: Props) {
  return (
    <HudFrame accent={accent} style={styles.frame}>
      <View style={styles.inner}>
        <Image source={assets.logo} style={styles.mark} resizeMode="contain" />
        <Text style={[styles.title, { color: accent }]}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
        {actionLabel && onAction ? (
          <View style={styles.action}>
            <PrimaryButton label={actionLabel} onPress={onAction} Icon={ActionIcon} height={52} />
          </View>
        ) : null}
      </View>
    </HudFrame>
  );
}

const styles = StyleSheet.create({
  frame: { marginHorizontal: 4 },
  inner: { padding: 24, alignItems: 'center' },
  mark: { width: 64, height: 64, opacity: 0.55 },
  title: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  action: { marginTop: 18, width: 200 },
});

export default EmptyState;
