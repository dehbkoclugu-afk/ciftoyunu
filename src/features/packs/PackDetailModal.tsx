import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';

import { PackArtwork } from './PackArtwork';
import type { PackCatalogItem } from './packCatalog';

type PackDetailModalProps = {
  item: PackCatalogItem | null;
  selected: boolean;
  onClose: () => void;
  onSelect: (packId: string) => void;
};

export function PackDetailModal({ item, selected, onClose, onSelect }: PackDetailModalProps) {
  const theme = useAppTheme();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={item !== null}
    >
      {item ? (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.canvas }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.closeRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close pack details"
                hitSlop={10}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.close,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <AppText variant="button">Close</AppText>
              </Pressable>
            </View>

            <PackArtwork artworkId={item.artworkId} height={260} borderRadius={theme.radius.card} />

            <View style={styles.heading}>
              <View style={styles.kickerRow}>
                <AppText variant="caption" tone="muted">
                  {item.premium ? 'Premium pack' : 'Free pack'}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {item.questionCount} questions · {item.intensityRange[0]}-{item.intensityRange[1]}{' '}
                  intensity
                </AppText>
              </View>
              <AppText variant="display">{item.title}</AppText>
              <AppText variant="h3" tone="muted">
                {item.promise}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText variant="h3">What this pack is for</AppText>
              <AppText tone="muted">{item.description}</AppText>
            </View>
            <View style={styles.section}>
              <AppText variant="h3">Good for</AppText>
              <AppText tone="muted">{item.audience}</AppText>
            </View>

            {item.contentWarnings.length > 0 ? (
              <View style={styles.section}>
                <AppText variant="h3">Before you begin</AppText>
                <AppText tone="muted">{item.contentWarnings.join(' · ')}</AppText>
              </View>
            ) : null}

            <View style={styles.section}>
              <AppText variant="h3">A look inside</AppText>
              {item.sampleQuestions.map((question) => (
                <View
                  key={question.id}
                  style={[
                    styles.sample,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.outline,
                      borderRadius: theme.radius.input,
                    },
                  ]}
                >
                  <AppText variant="questionSmall">{question.text}</AppText>
                </View>
              ))}
            </View>

            <View style={styles.action}>
              {item.premium ? (
                <View
                  accessibilityRole="text"
                  style={[
                    styles.locked,
                    {
                      backgroundColor: theme.colors.surfaceRaised,
                      borderRadius: theme.radius.input,
                    },
                  ]}
                >
                  <AppText variant="button">Premium access is required for this pack.</AppText>
                  <AppText variant="bodySmall" tone="muted">
                    Preview the questions and decide whether this deck fits your table.
                  </AppText>
                </View>
              ) : selected ? (
                <AppButton label="Selected" disabled onPress={() => undefined} />
              ) : (
                <AppButton label={`Choose ${item.title}`} onPress={() => onSelect(item.id)} />
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, paddingBottom: 44 },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 14 },
  close: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
  },
  heading: { marginTop: 24, gap: 10 },
  kickerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  section: { marginTop: 28, gap: 10 },
  sample: { padding: 18, borderWidth: 1, minHeight: 132, justifyContent: 'center' },
  action: { marginTop: 30 },
  locked: { padding: 18, gap: 6 },
});
