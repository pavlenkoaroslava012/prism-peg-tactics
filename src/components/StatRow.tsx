import React from 'react';
import { StyleSheet, View } from 'react-native';
import StatCard, { type StatItem } from './StatCard';
import type { IconComponent } from './icon';

interface Props {
  items: StatItem[];
  Icon?: IconComponent;
}

function isVisible(item: StatItem): boolean {
  if (item.value === '' || item.value === null || item.value === undefined) {return false;}
  if (typeof item.value === 'number' && item.value === 0) {return false;}
  return true;
}

/**
 * Renders only when at least two pills survive the null filter: a lone pill
 * in a three-wide row reads as a broken skeleton.
 */
export function StatRow({ items, Icon }: Props) {
  const visible = items.filter(isVisible);
  if (visible.length < 2) {return null;}

  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.key} style={styles.slot}>
          <StatCard {...item} Icon={Icon} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
});

export default StatRow;
