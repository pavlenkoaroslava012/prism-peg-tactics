import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { LayoutGrid } from 'lucide-react-native';
import EmptyState from '../components/EmptyState';
import HudFrame from '../components/HudFrame';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import ShardTile from '../components/ShardTile';
import { TOTAL_SHARDS } from '../constants/config';
import THEME, { TINT_LABEL } from '../constants/theme';
import { SHARDS, type Shard } from '../game/shards';

interface Props {
  unlockedCount: number;
  onChallenge: () => void;
  onBack: () => void;
}

export function CollectionScreen({ unlockedCount, onChallenge, onBack }: Props) {
  const [detail, setDetail] = useState<Shard | null>(null);
  const openDetail = useCallback((shard: Shard) => setDetail(shard), []);
  const closeDetail = useCallback(() => setDetail(null), []);

  return (
    <ScreenBackground>
      <ScreenHeader
        title="COLLECTION"
        subtitle="PRISM SHARDS"
        onBack={onBack}
        rightSlot={<Text style={styles.count}>{unlockedCount + '/' + TOTAL_SHARDS}</Text>}
      />

      <View style={styles.body}>
        {unlockedCount === 0 ? (
          <EmptyState
            title="NO FACETS CUT YET"
            hint="Solve a route at par to cut your first shard. Every two three-star solves add one facet."
            actionLabel="CHALLENGE"
            onAction={onChallenge}
            ActionIcon={LayoutGrid}
          />
        ) : (
          <>
            <View style={styles.grid}>
              {SHARDS.map((shard, i) => (
                <View key={shard.id} style={styles.cell}>
                  <ShardTile shard={shard} unlocked={i < unlockedCount} onPress={openDetail} />
                </View>
              ))}
            </View>
            <Text style={styles.hint}>TAP AN UNLOCKED FACET TO READ WHAT IT TEACHES</Text>
          </>
        )}
      </View>

      <Modal visible={detail !== null} transparent animationType="fade" onRequestClose={closeDetail}>
        <View style={styles.backdrop}>
          {detail !== null ? (
            <HudFrame accent={THEME.tints[detail.tint]} style={styles.sheet}>
              <View style={styles.sheetInner}>
                <Text style={[styles.sheetTitle, { color: THEME.tints[detail.tint] }]}>
                  {detail.name}
                </Text>
                <Text style={styles.sheetTint}>{TINT_LABEL[detail.tint] + ' SPECTRUM'}</Text>
                <Text style={styles.sheetBody}>{detail.lore}</Text>
                <Text style={styles.sheetSource}>
                  {'ROUTE ' + String(detail.sourceRoute + 1).padStart(2, '0') + ' - 3 STARS'}
                </Text>
                <View style={styles.sheetAction}>
                  <SecondaryButton label="CLOSE" onPress={closeDetail} height={48} />
                </View>
              </View>
            </HudFrame>
          ) : null}
        </View>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  count: {
    color: THEME.colors.secondary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1, padding: 16, gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '31%', flexGrow: 1 },
  hint: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,0,12,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: { width: '100%', maxWidth: 340, backgroundColor: THEME.colors.surface },
  sheetInner: { padding: 22, alignItems: 'center' },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  sheetTint: {
    marginTop: 4,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sheetBody: {
    marginTop: 12,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  sheetSource: {
    marginTop: 12,
    color: THEME.colors.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  sheetAction: { marginTop: 18, width: '100%' },
});

export default CollectionScreen;
