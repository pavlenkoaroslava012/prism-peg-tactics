import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HEADER_H, HEADER_TOP } from '../constants/config';
import THEME from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

interface Props {
  title: string;
  subtitle?: string;
  /** When set, the left slot becomes the MENU return button. */
  onBack?: () => void;
  backLabel?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

/**
 * The one header every screen uses. Different slots per screen, identical
 * padding, hairline and type — so the screens cannot drift apart.
 */
export function ScreenHeader({ title, subtitle, onBack, backLabel = 'MENU', leftSlot, rightSlot }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            hitSlop={HIT}
            onPress={onBack}
            style={styles.back}>
            <Text style={styles.backText}>{backLabel}</Text>
          </Pressable>
        ) : (
          leftSlot ?? null
        )}
      </View>

      <View style={styles.centre}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: HEADER_TOP,
    height: HEADER_TOP + HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.headerFill,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.hairline,
  },
  side: {
    width: 104,
    height: 48,
    justifyContent: 'center',
  },
  sideRight: { alignItems: 'flex-end' },
  back: {
    width: 76,
    height: 48,
    justifyContent: 'center',
  },
  backText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 2,
    color: THEME.colors.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
});

export default ScreenHeader;
