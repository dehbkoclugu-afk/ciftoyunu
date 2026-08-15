/**
 * THESIS: A pack library should feel like choosing one beautiful deck from a real table, not browsing a store grid.
 * OWN-WORLD: Image-led plum/cream cards, original geometric covers, quiet filter chips, and one coral intensity signal.
 * STORY: See only packs that fit the table, narrow by mood, inspect real questions, then make one honest selection.
 * FIRST VIEWPORT: Back action and mode-aware title above a low filter rail, with the first large cover already visible.
 * FORM: Operate-mode editorial shelf; responsive one/two-column cards with detail-first native modal behavior.
 */
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton, AppScreen, AppText, Chip } from '@/components/primitives';
import { loadEmbeddedContent } from '@/content/loader';
import { useAppTheme } from '@/design';
import { PackCard } from '@/features/packs/PackCard';
import { PackDetailModal } from '@/features/packs/PackDetailModal';
import {
  buildPackCatalog,
  getAvailablePackFilters,
  type PackCatalogItem,
  type PackFilter,
} from '@/features/packs/packCatalog';
import { getLocaleOption } from '@/i18n';
import { track } from '@/services/analytics/runtime';
import { useGameSetupStore } from '@/state/gameSetupStore';
import { usePurchaseStore } from '@/state/purchaseStore';
import { useSettingsStore } from '@/state/settingsStore';

const filterLabels: Record<PackFilter, string> = {
  all: 'All',
  free: 'Free',
  fun: 'Fun',
  deep: 'Deep',
  relationship: 'Relationship',
  spicy: 'Spicy',
  friends: 'Friends',
};

export default function PacksScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<PackFilter>('all');
  const [detail, setDetail] = useState<PackCatalogItem | null>(null);
  const locale = useSettingsStore((state) => state.locale);
  const ageConfirmed18 = useSettingsStore((state) => state.ageConfirmed18);
  const comfortLevel = useSettingsStore((state) => state.comfortLevel);
  const mode = useGameSetupStore((state) => state.mode);
  const selectedPackId = useGameSetupStore((state) => state.selectedPackId);
  const selectPack = useGameSetupStore((state) => state.selectPack);
  const entitled = usePurchaseStore((state) => state.entitlement === 'premium');
  const bundle = loadEmbeddedContent(locale);
  const wide = width >= 680;
  const catalog = bundle
    ? buildPackCatalog(bundle, { mode, ageConfirmed18, comfortLevel, filter })
    : [];

  useEffect(() => {
    track('pack_library_viewed', { mode });
  }, [mode]);

  const choose = (packId: string) => {
    track('pack_selected', { pack_id: packId, source: 'library' });
    selectPack(packId);
    setDetail(null);
    router.push('/session-setup');
  };

  const unlock = (packId: string) => {
    track('pack_selected', { pack_id: packId, source: 'locked_library' });
    selectPack(packId);
    setDetail(null);
    router.push({ pathname: '/premium', params: { packId } });
  };

  if (!bundle) {
    return (
      <AppScreen contentStyle={styles.emptyScreen}>
        <View style={styles.back}>
          <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
        </View>
        <View style={styles.emptyCopy}>
          <AppText variant="display">
            Packs are not ready in {getLocaleOption(locale).nativeName} yet.
          </AppText>
          <AppText tone="muted">
            We will show a pack only after its questions and presentation have been reviewed in this
            language.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.back}>
        <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
      </View>

      <View style={styles.intro}>
        <AppText variant="display">Choose tonight&apos;s deck.</AppText>
        <AppText tone="muted">
          {mode === 'friends'
            ? 'Only packs made for your group are on this table.'
            : 'Start light, laugh first, or make room for something deeper.'}
        </AppText>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRail}
      >
        {getAvailablePackFilters().map((option) => (
          <Chip
            key={option}
            label={filterLabels[option]}
            selected={filter === option}
            onPress={() => setFilter(option)}
          />
        ))}
      </ScrollView>

      {catalog.length > 0 ? (
        <View style={styles.grid}>
          {catalog.map((item) => (
            <PackCard
              key={item.id}
              item={item}
              selected={selectedPackId === item.id}
              wide={wide}
              onPress={(item) => {
                setDetail(item);
                track('pack_viewed', { pack_id: item.id, premium: item.premium });
              }}
            />
          ))}
        </View>
      ) : (
        <View
          accessibilityRole="text"
          style={[
            styles.noResults,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.card,
            },
          ]}
        >
          <AppText variant="h2">
            No {filterLabels[filter].toLowerCase()} packs fit this table yet.
          </AppText>
          <AppText tone="muted">Choose another filter to see the available decks.</AppText>
        </View>
      )}

      <PackDetailModal
        item={detail}
        selected={detail?.id === selectedPackId}
        entitled={entitled}
        onClose={() => setDetail(null)}
        onSelect={choose}
        onUnlock={unlock}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { width: 92, marginLeft: -20 },
  intro: { marginTop: 14, gap: 10, maxWidth: 590 },
  filterRail: { marginHorizontal: -20, marginTop: 24 },
  filters: { paddingHorizontal: 20, gap: 8 },
  grid: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  noResults: {
    marginTop: 20,
    padding: 24,
    borderWidth: 1,
    gap: 8,
    minHeight: 150,
    justifyContent: 'center',
  },
  emptyScreen: { paddingBottom: 32 },
  emptyCopy: { flex: 1, justifyContent: 'center', gap: 14, maxWidth: 560 },
});
