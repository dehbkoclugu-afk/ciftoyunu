import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';

type HowItWorksSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const steps = [
  ['1', 'Pick a mood', 'Choose how light or deep you want the conversation to feel.'],
  ['2', 'Deal a card', 'Put one phone between you and take turns answering.'],
  ['3', 'Keep what matters', 'Pass freely. No answers are recorded or sent anywhere.'],
] as const;

export function HowItWorksSheet({ visible, onClose }: HowItWorksSheetProps) {
  const theme = useAppTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close how it works"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.card,
            },
          ]}
        >
          <View style={styles.heading}>
            <AppText variant="h2">Three steps. One good conversation.</AppText>
            <AppText tone="muted">No score, no pressure, no account.</AppText>
          </View>
          <View>
            {steps.map(([number, title, description], index) => (
              <View
                key={number}
                style={[
                  styles.step,
                  index > 0 ? { borderTopColor: theme.colors.outline, borderTopWidth: 1 } : null,
                ]}
              >
                <AppText variant="h3" tone="primary" style={styles.number}>
                  {number}
                </AppText>
                <View style={styles.stepCopy}>
                  <AppText variant="button">{title}</AppText>
                  <AppText variant="bodySmall" tone="muted">
                    {description}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
          <AppButton label="Got it" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 16, 21, 0.66)',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 24,
    borderWidth: 1,
    gap: 24,
  },
  heading: { gap: 8 },
  step: { flexDirection: 'row', gap: 16, paddingVertical: 16 },
  number: { width: 28 },
  stepCopy: { flex: 1, gap: 3 },
});
