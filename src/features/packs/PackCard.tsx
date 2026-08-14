import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';

import { PackArtwork } from './PackArtwork';
import type { PackCatalogItem } from './packCatalog';

type PackCardProps = {
  item: PackCatalogItem;
  selected: boolean;
  wide: boolean;
  onPress: (item: PackCatalogItem) => void;
};

export function PackCard({ item, selected, wide, onPress }: PackCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title} details`}
      accessibilityHint={
        item.premium
          ? 'Shows pack details and premium status'
          : 'Shows pack details before selection'
      }
      accessibilityState={{ selected }}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          width: wide ? '48.5%' : '100%',
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderRadius: theme.radius.card,
          borderWidth: selected ? 3 : 1,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <View>
        <PackArtwork artworkId={item.artworkId} height={wide ? 156 : 178} borderRadius={13} />
        <View
          style={[
            styles.badge,
            {
              backgroundColor: item.premium ? theme.colors.ink : theme.colors.surfaceRaised,
              borderColor: item.premium ? theme.colors.ink : theme.colors.outline,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{
              color: item.premium ? theme.colors.canvas : theme.colors.ink,
              fontWeight: '700',
            }}
          >
            {item.premium ? 'Premium' : 'Free'}
          </AppText>
        </View>
        {item.seasonal ? (
          <View
            style={[
              styles.seasonalBadge,
              { backgroundColor: theme.colors.coral, borderColor: theme.colors.surface },
            ]}
          >
            <AppText variant="caption" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
              Seasonal
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="h2" style={styles.title}>
            {item.title}
          </AppText>
          {selected ? (
            <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              Selected
            </AppText>
          ) : null}
        </View>
        <AppText tone="muted" numberOfLines={2}>
          {item.promise}
        </AppText>
        <View style={styles.meta}>
          <AppText variant="caption" tone="muted">
            About {item.durationMinutes} min
          </AppText>
          <View
            accessibilityLabel={`Intensity ${item.intensityRange[0]} to ${item.intensityRange[1]} of 5`}
            style={styles.intensity}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      level <= item.intensityRange[1] ? theme.colors.coral : theme.colors.outline,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', minHeight: 318 },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
  },
  seasonalBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
  },
  copy: { padding: 16, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  title: { flex: 1 },
  meta: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  intensity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
