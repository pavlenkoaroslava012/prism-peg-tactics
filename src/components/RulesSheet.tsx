import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';
import HudFrame from './HudFrame';
import SecondaryButton from './SecondaryButton';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** Four numbered steps, each naming the gesture AND its result. */
const STEPS = [
  {
    title: 'READ THE BIAS',
    body: 'Every peg shows a small triangle. It is the direction the orb leaves that peg, so the whole fall is readable before you touch anything.',
  },
  {
    title: 'TAP A PEG TO PLACE A GATE',
    body: 'A tap on an empty peg drops a prism gate and spends one redirect from the budget shown in the header.',
  },
  {
    title: 'TAP AGAIN TO ROTATE',
    body: 'Rotation is free: LEFT forces the orb left, RIGHT forces it right, PRISM sends it straight down and paints it with that peg spectrum tint.',
  },
  {
    title: 'PRESS DROP TO RESOLVE',
    body: 'The orb must settle in the lit slot carrying the required tint. SCAN previews the route, UNDO refunds the last gate.',
  },
];

export function RulesSheet({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <HudFrame accent={THEME.colors.secondary} style={styles.card}>
          <View style={styles.inner}>
            <Text style={styles.heading}>HOW TO PLAY</Text>
            {STEPS.map((step, i) => (
              <View key={step.title} style={styles.step}>
                <View style={styles.bullet}>
                  <Text style={styles.bulletText}>{i + 1}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
            <View style={styles.action}>
              <SecondaryButton label="CLOSE" onPress={onClose} height={48} />
            </View>
          </View>
        </HudFrame>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,0,12,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 360, backgroundColor: THEME.colors.surface },
  inner: { padding: 20 },
  heading: {
    color: THEME.colors.secondary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 14,
  },
  step: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.hudBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    color: THEME.colors.secondary,
    fontSize: 11,
    lineHeight: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stepText: { flex: 1 },
  stepTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  stepBody: {
    marginTop: 3,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  action: { marginTop: 6 },
});

export default RulesSheet;
