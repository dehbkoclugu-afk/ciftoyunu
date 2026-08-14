import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { categoryColors, useAppTheme } from '@/design';

export default function DevGalleryScreen() {
  const theme = useAppTheme();
  const [intensity, setIntensity] = useState<'light' | 'mixed' | 'deep'>('light');
  const [lastAction, setLastAction] = useState('No action yet');

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[16] }}>
      <View style={styles.heading}>
        <BrandMark size={56} />
        <View style={styles.headingCopy}>
          <AppText variant="h1">Design system</AppText>
          <AppText tone="muted">Development-only component and token gallery.</AppText>
        </View>
      </View>

      <GallerySection title="Typography">
        <AppText variant="display">A better question</AppText>
        <AppText variant="h2">One shared evening</AppText>
        <AppText>Body copy remains calm and readable at every supported text size.</AppText>
        <AppText variant="caption" tone="muted">
          CAPTION · SUPPORTING CONTEXT
        </AppText>
      </GallerySection>

      <GallerySection title="Actions">
        <AppButton label="Start playing" onPress={() => setLastAction('Started')} />
        <AppButton
          label="See how it works"
          variant="secondary"
          onPress={() => setLastAction('Opened explanation')}
        />
        <AppButton label="Not now" variant="ghost" onPress={() => setLastAction('Dismissed')} />
        <AppButton label="Loading packs" loading onPress={() => undefined} />
        <AppText variant="caption" tone="muted">
          Last action: {lastAction}
        </AppText>
      </GallerySection>

      <GallerySection title="Choices">
        <View style={styles.wrap}>
          <Chip
            label="Light"
            selected={intensity === 'light'}
            onPress={() => setIntensity('light')}
          />
          <Chip
            label="Mixed"
            selected={intensity === 'mixed'}
            onPress={() => setIntensity('mixed')}
          />
          <Chip label="Deep" selected={intensity === 'deep'} onPress={() => setIntensity('deep')} />
          <Chip label="Unavailable" disabled onPress={() => undefined} />
        </View>
      </GallerySection>

      <GallerySection title="Pack colors">
        <View style={styles.swatches}>
          {Object.entries(categoryColors).map(([name, color]) => (
            <View key={name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: color }]} />
              <AppText variant="caption">{name}</AppText>
            </View>
          ))}
        </View>
      </GallerySection>
    </AppScreen>
  );
}

function GallerySection({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const theme = useAppTheme();

  return (
    <View style={[styles.section, { borderTopColor: theme.colors.outline }]}>
      <AppText variant="h3">{title}</AppText>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 28 },
  headingCopy: { flex: 1, gap: 4 },
  section: { paddingVertical: 28, borderTopWidth: 1 },
  sectionContent: { marginTop: 18, gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  swatchItem: { width: 88, gap: 6 },
  swatch: { height: 56, borderRadius: 16 },
});
