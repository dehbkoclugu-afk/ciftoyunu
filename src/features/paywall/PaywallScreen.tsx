/**
 * THESIS: Premium is an open deck with a legible receipt, not a trap door.
 * OWN-WORLD: Plum invitation field, warm card table, coral registration marks, quiet plan rows.
 * STORY: See what opens, compare real store terms, choose once, then return to the intended deck.
 * FIRST VIEWPORT: Visible close, one decisive promise, three benefits, then the first store plan.
 * FORM: Persuade-mode single-screen table receipt extending the established editorial card world.
 */
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText } from '@/components/primitives';
import { getPurchaseRuntimeConfig } from '@/config/purchases';
import { loadEmbeddedContent } from '@/content/loader';
import { useAppTheme } from '@/design';
import type { PurchasePackage } from '@/services/purchases/types';
import { usePurchaseStore, type PurchaseStatus } from '@/state/purchaseStore';
import { useSettingsStore } from '@/state/settingsStore';

type PaywallScreenProps = {
  packId?: string;
  termsUrl?: string;
  privacyUrl?: string;
};

const statusCopy: Partial<Record<PurchaseStatus, { title: string; detail: string }>> = {
  offline: {
    title: 'The store is offline.',
    detail: 'Free decks still work. Reconnect when you are ready to see current plans.',
  },
  empty_offering: {
    title: 'Plans are temporarily unavailable.',
    detail: 'No store offering was returned. Free decks are still ready to play.',
  },
  configuration_error: {
    title: 'Purchases are unavailable in this test build.',
    detail: 'A configured mobile build is required. No test purchase will unlock premium here.',
  },
  purchase_error: {
    title: 'The purchase was not verified.',
    detail: 'Nothing was unlocked. Keep this plan selected and try again.',
  },
  cancelled: {
    title: 'Purchase cancelled.',
    detail: 'Nothing was charged. Your plan is still selected if you want to continue.',
  },
  nothing_to_restore: {
    title: 'No purchase was found to restore.',
    detail: 'Use the same store account as your original purchase, or choose a plan below.',
  },
  restore_error: {
    title: 'Restore could not finish.',
    detail: 'Check the connection and store account, then try Restore again.',
  },
};

function billingLine(item: PurchasePackage): string {
  if (item.packageType === 'lifetime') return `${item.price} once. No renewal.`;
  const renewal = item.period ? `${item.price} every ${item.period}` : item.price;
  return item.intro
    ? `${item.intro}. Then ${renewal}. Auto-renews until cancelled.`
    : `${renewal}. Auto-renews until cancelled.`;
}

export function PaywallScreen({ packId, termsUrl, privacyUrl }: PaywallScreenProps) {
  const theme = useAppTheme();
  const locale = useSettingsStore((state) => state.locale);
  const status = usePurchaseStore((state) => state.status);
  const entitlement = usePurchaseStore((state) => state.entitlement);
  const offering = usePurchaseStore((state) => state.offering);
  const selectedPackageId = usePurchaseStore((state) => state.selectedPackageId);
  const hydrate = usePurchaseStore((state) => state.hydrate);
  const refresh = usePurchaseStore((state) => state.refresh);
  const selectPackage = usePurchaseStore((state) => state.selectPackage);
  const purchase = usePurchaseStore((state) => state.purchase);
  const restore = usePurchaseStore((state) => state.restore);
  const bundle = loadEmbeddedContent(locale);
  const packTitle = bundle?.packCopy.find((item) => item.packId === packId)?.title;
  const runtime = getPurchaseRuntimeConfig();
  const resolvedTermsUrl = termsUrl ?? runtime.termsUrl;
  const resolvedPrivacyUrl = privacyUrl ?? runtime.privacyUrl;
  const busy = status === 'loading' || status === 'purchasing' || status === 'restoring';
  const message = statusCopy[status];

  useEffect(() => {
    if (status === 'unconfigured') void hydrate();
  }, [hydrate, status]);

  const continueAfterSuccess = () => {
    if (packId) router.replace('/session-setup');
    else router.back();
  };

  if (status === 'success' || entitlement === 'premium') {
    return (
      <AppScreen contentStyle={styles.success}>
        <View style={[styles.successMark, { backgroundColor: theme.colors.coral }]} />
        <AppText variant="display">Every conversation is open.</AppText>
        <AppText tone="muted">
          {packTitle ? `${packTitle} is ready for your table.` : 'All premium decks are ready.'}
        </AppText>
        <AppButton
          label={packTitle ? `Play ${packTitle}` : 'Continue'}
          onPress={continueAfterSuccess}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll contentStyle={{ paddingBottom: theme.spacing[10] }}>
      <View style={styles.closeRow}>
        <AppButton label="Close premium" variant="ghost" onPress={() => router.back()} />
      </View>

      <View
        style={[
          styles.invitation,
          { backgroundColor: theme.colors.primary, borderRadius: theme.radius.card },
        ]}
      >
        <View style={[styles.registration, { backgroundColor: theme.colors.coral }]} />
        <AppText variant="caption" style={{ color: theme.colors.onPrimary }}>
          PROJECT DUO PREMIUM
        </AppText>
        <AppText variant="display" style={{ color: theme.colors.onPrimary }}>
          Open every conversation.
        </AppText>
        <AppText style={{ color: theme.colors.onPrimary }}>
          {packTitle
            ? `Unlock ${packTitle} and every current premium deck.`
            : 'Keep the table open with every couple and friends deck.'}
        </AppText>
      </View>

      <View style={styles.benefits}>
        {[
          'All couple and friends decks',
          'New seasonal questions as they arrive',
          'Unlimited sessions shaped to your mood',
        ].map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <View style={[styles.benefitMark, { backgroundColor: theme.colors.coral }]} />
            <AppText variant="button" style={styles.flex}>
              {benefit}
            </AppText>
          </View>
        ))}
      </View>

      {message ? (
        <View
          accessibilityRole={status.includes('error') ? 'alert' : 'text'}
          style={[
            styles.notice,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderRadius: theme.radius.input,
            },
          ]}
        >
          <AppText variant="h3">{message.title}</AppText>
          <AppText tone="muted">{message.detail}</AppText>
        </View>
      ) : null}

      {status === 'loading' ? (
        <View
          style={styles.loading}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading store plans"
        >
          <AppText variant="h3">Loading current store plans…</AppText>
          <AppText tone="muted">Prices and trial terms come directly from your store.</AppText>
        </View>
      ) : null}

      {offering ? (
        <View style={styles.plans} accessibilityRole="radiogroup">
          <AppText variant="h2">Choose your plan</AppText>
          {offering.packages.map((item) => {
            const selected = item.id === selectedPackageId;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={`${item.title}. ${billingLine(item)}`}
                accessibilityState={{ checked: selected, disabled: busy }}
                disabled={busy}
                onPress={() => selectPackage(item.id)}
                style={({ pressed }) => [
                  styles.plan,
                  {
                    backgroundColor: selected ? theme.colors.surfaceRaised : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    borderRadius: theme.radius.input,
                    borderWidth: selected ? 2 : 1,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <View style={styles.planTop}>
                  <View style={styles.flex}>
                    <AppText variant="h3">{item.title}</AppText>
                    {item.recommended ? (
                      <AppText variant="caption" tone="primary">
                        Recommended
                      </AppText>
                    ) : null}
                  </View>
                  <AppText variant="h2">{item.price}</AppText>
                </View>
                <AppText variant="bodySmall" tone="muted">
                  {billingLine(item)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.actions}>
        {offering ? (
          <AppButton
            label={
              selectedPackageId
                ? `Continue with ${offering.packages.find((item) => item.id === selectedPackageId)?.title ?? 'selected plan'}`
                : 'Choose a plan'
            }
            loading={status === 'purchasing'}
            disabled={!selectedPackageId || status === 'restoring'}
            onPress={() => void purchase()}
          />
        ) : (
          <AppButton
            label="Retry store connection"
            loading={status === 'loading'}
            disabled={status === 'configuration_error'}
            onPress={() => void refresh()}
          />
        )}
        <AppButton
          label="Restore purchases"
          variant="secondary"
          loading={status === 'restoring'}
          disabled={
            status === 'loading' || status === 'purchasing' || status === 'configuration_error'
          }
          onPress={() => void restore()}
        />
      </View>

      <View style={styles.legal}>
        {resolvedTermsUrl && resolvedPrivacyUrl ? (
          <>
            <AppButton
              label="Terms"
              variant="ghost"
              onPress={() => void Linking.openURL(resolvedTermsUrl)}
            />
            <AppButton
              label="Privacy"
              variant="ghost"
              onPress={() => void Linking.openURL(resolvedPrivacyUrl)}
            />
          </>
        ) : (
          <AppText variant="caption" tone="muted" style={styles.centered}>
            Terms and privacy links are unavailable in this test build.
          </AppText>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  closeRow: { width: 150, marginLeft: -20 },
  invitation: {
    marginTop: 12,
    minHeight: 260,
    padding: 26,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  registration: {
    position: 'absolute',
    right: 26,
    top: 26,
    width: 34,
    height: 6,
    borderRadius: 3,
  },
  benefits: { marginTop: 26, gap: 14 },
  benefitRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitMark: { width: 10, height: 10, borderRadius: 5 },
  notice: { marginTop: 24, padding: 18, gap: 6 },
  loading: { minHeight: 190, justifyContent: 'center', gap: 8 },
  plans: { marginTop: 30, gap: 12 },
  plan: { minHeight: 112, padding: 18, justifyContent: 'center', gap: 10 },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { marginTop: 24, gap: 10 },
  legal: {
    minHeight: 56,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: { textAlign: 'center' },
  success: { justifyContent: 'center', gap: 18, maxWidth: 560 },
  successMark: { width: 56, height: 8, borderRadius: 4 },
});
