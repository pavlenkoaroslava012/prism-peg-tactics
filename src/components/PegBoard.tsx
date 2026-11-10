import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BOARD_FRAME,
  BOARD_H,
  BOARD_W,
  LANES,
  ROWS,
  TILE,
  pegCenterX,
} from '../constants/config';
import THEME from '../constants/theme';
import { pegId, type Gates, type Layout } from '../game/boardSim';
import HudFrame from './HudFrame';
import PegNode from './PegNode';
import SlotRow from './SlotRow';

interface Props {
  layout: Layout;
  gates: Gates;
  chargedIds: string[];
  showMarkers: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  landedIndex: number | null;
  landedSolved: boolean;
  dim: boolean;
  disabled: boolean;
  onPegPress: (row: number, col: number) => void;
  /** Orb, trail and ghost route are composed in by the caller. */
  overlay?: React.ReactNode;
  scale?: number;
}

/**
 * Pure rendering driven by the BOARD_FRAME geometry: peg columns, the funnel
 * mouth, the slot row and the bracketed frame. Overflow stays within the
 * frame because every lane centre is derived from TILE.
 */
export function PegBoard({
  layout,
  gates,
  chargedIds,
  showMarkers,
  highContrast,
  reducedMotion,
  landedIndex,
  landedSolved,
  dim,
  disabled,
  onPegPress,
  overlay,
  scale = 1,
}: Props) {
  const charged = useMemo(() => new Set(chargedIds), [chargedIds]);
  const funnelX = pegCenterX(layout.entryLane);

  const board = (
    <HudFrame accent={THEME.colors.secondary} bracketSize={20} style={styles.frame}>
      {/* The 2px feed line dropping from the funnel throat into the entry lane. */}
      <View style={[styles.feed, { left: funnelX - 1 }]} />
      <View style={styles.inner}>
        {Array.from({ length: ROWS }, (_, row) => (
          <View key={row} style={styles.pegRow}>
            {Array.from({ length: LANES }, (_, col) => {
              const peg = layout.pegs[row * LANES + col];
              return (
                <PegNode
                  key={col}
                  row={row}
                  col={col}
                  bias={peg.bias}
                  tint={peg.tint}
                  charged={charged.has(pegId(row, col))}
                  gate={gates[pegId(row, col)]}
                  showMarkers={showMarkers}
                  dim={dim}
                  disabled={disabled}
                  onPress={onPegPress}
                />
              );
            })}
          </View>
        ))}

        <SlotRow
          targetIndex={layout.targetLane}
          requiredTint={layout.requiredTint}
          highContrast={highContrast}
          landedIndex={landedIndex}
          landedSolved={landedSolved}
          reducedMotion={reducedMotion}
        />
      </View>
      {overlay}
    </HudFrame>
  );

  if (scale === 1) {return board;}

  return (
    <View style={{ width: BOARD_W * scale, height: BOARD_H * scale }}>
      <View
        pointerEvents="none"
        style={[
          styles.scaled,
          {
            left: -(BOARD_W * (1 - scale)) / 2,
            top: -(BOARD_H * (1 - scale)) / 2,
            transform: [{ scale }],
          },
        ]}>
        {board}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: BOARD_W,
    height: BOARD_H,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.boardFill,
    borderWidth: 2,
    borderColor: THEME.colors.hudBorder,
  },
  inner: { position: 'absolute', left: BOARD_FRAME, top: BOARD_FRAME },
  pegRow: { flexDirection: 'row', height: TILE },
  feed: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: BOARD_FRAME + TILE / 2,
    backgroundColor: THEME.colors.secondary,
    opacity: 0.55,
  },
  scaled: { position: 'absolute', width: BOARD_W, height: BOARD_H },
});

export default PegBoard;
