import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import THEME from '../constants/theme';
import HudFrame from './HudFrame';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

interface Props {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel = 'CANCEL',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <HudFrame accent={THEME.colors.tertiary} style={styles.card}>
          <View style={styles.inner}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            <View style={styles.actions}>
              <PrimaryButton
                label={confirmLabel}
                onPress={onConfirm}
                height={52}
                colors={[THEME.colors.tertiary, THEME.colors.primary]}
              />
              <SecondaryButton label={cancelLabel} onPress={onCancel} height={48} />
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
    backgroundColor: 'rgba(5,0,12,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 340, backgroundColor: THEME.colors.surface },
  inner: { padding: 22 },
  title: {
    color: THEME.colors.tertiary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: { marginTop: 20, gap: 10 },
});

export default ConfirmSheet;
