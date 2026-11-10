import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import THEME from '../constants/theme';

interface Props {
  charged: number;
  quota: number;
}

/** The 3px strip across the control bar: five newly lit pegs refund a redirect. */
export function ChargeStrip({ charged, quota }: Props) {
  const ratio = Math.max(0, Math.min(1, quota > 0 ? charged / quota : 0));
  return (
    <View style={styles.track} pointerEvents="none">
      <LinearGradient
        colors={THEME.gradients.charge as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { flex: ratio }]}
      />
      <View style={{ flex: 1 - ratio }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
    backgroundColor: THEME.colors.track,
  },
  fill: { height: 3 },
});

export default ChargeStrip;
