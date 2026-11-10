import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import assets from '../assets';
import THEME from '../constants/theme';
import { shardRequirement, type Shard } from '../game/shards';

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

interface Props {
  shard: Shard;
  unlocked: boolean;
  onPress: (shard: Shard) => void;
}

export function ShardTile({ shard, unlocked, onPress }: Props) {
  const tint = THEME.tints[shard.tint];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unlocked ? shard.name : 'LOCKED SHARD'}
      accessibilityState={{ disabled: !unlocked }}
      hitSlop={HIT}
      disabled={!unlocked}
      onPress={() => onPress(shard)}
      style={styles.press}>
      <View style={[styles.tile, unlocked ? { borderColor: tint + '66' } : styles.locked]}>
        {unlocked ? (
          <>
            <Image source={assets.spriteShard} style={styles.sprite} resizeMode="contain" />
            <Text style={styles.name} numberOfLines={2}>
              {shard.name}
            </Text>
            <View style={[styles.dot, { backgroundColor: tint }]} />
          </>
        ) : (
          <>
            <Lock size={20} color={THEME.colors.textMuted} />
            <Text style={styles.requirement} numberOfLines={2}>
              {shardRequirement(shard)}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 96 },
  tile: {
    width: '100%',
    height: 96,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.glass,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  locked: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  sprite: { width: 40, height: 40 },
  name: {
    color: THEME.colors.textPrimary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  requirement: {
    color: THEME.colors.textMuted,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
});

export default React.memo(ShardTile);
