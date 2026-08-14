import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';

type Confirmation = 'report' | 'filters' | 'end' | null;

type PauseSheetProps = {
  visible: boolean;
  canReport: boolean;
  onContinue: () => void;
  onAnother: () => void;
  onReport: () => void;
  onChangeFilters: () => void;
  onEnd: () => void;
};

export function PauseSheet({
  visible,
  canReport,
  onContinue,
  onAnother,
  onReport,
  onChangeFilters,
  onEnd,
}: PauseSheetProps) {
  const theme = useAppTheme();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  const confirm = (action: () => void) => {
    setConfirmation(null);
    action();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => confirm(onContinue)}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.canvas }]}>
        <View style={styles.content} accessibilityViewIsModal>
          {confirmation ? (
            <View style={styles.confirmation}>
              <AppText variant="display">
                {confirmation === 'report'
                  ? 'Report this card?'
                  : confirmation === 'filters'
                    ? 'Change the filters?'
                    : 'End this session?'}
              </AppText>
              <AppText tone="muted">
                {confirmation === 'report'
                  ? 'The question ID is noted on this device. No answer or player name is included.'
                  : confirmation === 'filters'
                    ? 'This run will end and setup will open with a fresh deck.'
                    : 'Your saved questions stay on this device.'}
              </AppText>
              <View style={styles.actions}>
                <AppButton
                  label={
                    confirmation === 'report'
                      ? 'Report and pass'
                      : confirmation === 'filters'
                        ? 'End and change filters'
                        : 'End this session'
                  }
                  variant={confirmation === 'end' ? 'destructive' : 'primary'}
                  onPress={() =>
                    confirm(
                      confirmation === 'report'
                        ? onReport
                        : confirmation === 'filters'
                          ? onChangeFilters
                          : onEnd,
                    )
                  }
                />
                <AppButton
                  label="Keep playing"
                  variant="secondary"
                  onPress={() => setConfirmation(null)}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.heading}>
                <AppText variant="display">Paused.</AppText>
                <AppText tone="muted">The card stays here until you are ready.</AppText>
              </View>
              <View style={styles.actions}>
                <AppButton label="Continue" onPress={() => confirm(onContinue)} />
                <AppButton label="Another question" variant="secondary" onPress={onAnother} />
                <AppButton
                  label="Change topic filters"
                  variant="secondary"
                  onPress={() => setConfirmation('filters')}
                />
                {canReport ? (
                  <AppButton
                    label="Report this question"
                    variant="ghost"
                    onPress={() => setConfirmation('report')}
                  />
                ) : null}
                <AppButton
                  label="End session"
                  variant="ghost"
                  onPress={() => setConfirmation('end')}
                />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center', padding: 24 },
  heading: { marginTop: 44, gap: 10 },
  actions: { marginTop: 30, gap: 12 },
  confirmation: { flex: 1, justifyContent: 'center', gap: 12 },
});
