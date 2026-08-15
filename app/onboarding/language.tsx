import { useMemo, useState } from 'react';
import { TextInput, Pressable, StyleSheet, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { OnboardingHeader } from '@/features/onboarding/OnboardingHeader';
import { localeCatalog, normalizeLocale, type SupportedLocale } from '@/i18n';
import { track } from '@/services/analytics/runtime';
import { useSettingsStore } from '@/state/settingsStore';

export default function LanguageScreen() {
  const theme = useAppTheme();
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const [query, setQuery] = useState('');
  const suggestedLocale = normalizeLocale(getLocales()[0]?.languageTag);
  const filteredLocales = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return localeCatalog;

    return localeCatalog.filter(
      (option) =>
        option.nativeName.toLocaleLowerCase().includes(normalizedQuery) ||
        option.englishName.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const chooseLocale = (nextLocale: SupportedLocale) => {
    setLocale(nextLocale);
    track('locale_changed', { locale: nextLocale });
  };

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[8] }}>
      <OnboardingHeader current={1} />

      <View style={styles.intro}>
        <AppText variant="display">Choose your language.</AppText>
        <AppText tone="muted">
          Start with the language that feels most natural. You can change it later.
        </AppText>
      </View>

      <View style={styles.searchGroup}>
        <AppText variant="caption" tone="muted">
          Find a language
        </AppText>
        <TextInput
          accessibilityLabel="Search languages"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Native or English name"
          placeholderTextColor={theme.colors.inkMuted}
          returnKeyType="search"
          style={[
            styles.search,
            theme.typography.body,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              borderRadius: theme.radius.input,
              color: theme.colors.ink,
            },
          ]}
          value={query}
        />
      </View>

      <View accessibilityRole="radiogroup" style={styles.localeList}>
        {filteredLocales.map((option) => {
          const selected = locale === option.code;
          const suggested = suggestedLocale === option.code;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={option.englishName}
              accessibilityState={{ selected }}
              key={option.code}
              onPress={() => chooseLocale(option.code)}
              style={({ pressed }) => [
                styles.localeRow,
                {
                  backgroundColor: selected ? theme.colors.surfaceRaised : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.outline,
                  borderRadius: theme.radius.button,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={styles.localeCopy}>
                <AppText variant="h3">{option.nativeName}</AppText>
                <AppText variant="bodySmall" tone="muted">
                  {option.englishName}
                  {suggested ? ' · Suggested' : ''}
                </AppText>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    backgroundColor: selected ? theme.colors.primary : 'transparent',
                  },
                ]}
              >
                {selected ? (
                  <View style={[styles.radioDot, { backgroundColor: theme.colors.onPrimary }]} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
        {filteredLocales.length === 0 ? (
          <View style={styles.empty}>
            <AppText variant="h3">No language found</AppText>
            <AppText tone="muted">Try a native or English language name.</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.action}>
        <AppButton label="Continue" onPress={() => router.push('/onboarding/welcome')} />
        <AppText variant="caption" tone="muted" style={styles.centered}>
          Question packs never mix languages.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 24, gap: 12, maxWidth: 560 },
  searchGroup: { gap: 7, marginTop: 28 },
  search: { minHeight: 54, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  localeList: { gap: 10, marginTop: 16 },
  localeRow: {
    minHeight: 76,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  localeCopy: { flex: 1, gap: 2 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', gap: 4, paddingVertical: 36 },
  action: { gap: 12, marginTop: 28 },
  centered: { textAlign: 'center' },
});
