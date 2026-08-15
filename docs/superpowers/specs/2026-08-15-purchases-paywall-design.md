# Purchases and Paywall Design

**Status:** Approved by the master implementation contract and the user's instruction to continue autonomously.

## Scope

PR 8 adds the first real premium boundary: RevenueCat configuration, verified entitlement state, offerings, purchase and restore operations, a contextual paywall, and premium-pack access. It does not add analytics, experiments, settings, remote paywalls, or production store products; those remain later PRs or external RevenueCat configuration.

## Chosen approach

Use RevenueCat's core `react-native-purchases` SDK behind a small application-owned adapter and keep the paywall UI native to the existing Project Duo design system.

Alternatives considered:

1. RevenueCat Paywalls UI would reduce local UI code but add another native dependency and move the product's most important conversion surface outside the established card-table design language.
2. A dev-only fake purchase boundary would unblock screenshots but violate the product contract because it cannot verify receipts or safely grant premium access.

The chosen approach is the smallest complete boundary: one provider dependency, provider-neutral domain DTOs, and no fake success path in application code.

## Configuration and release safety

- Pin `react-native-purchases` to `10.7.1`, the current stable release verified on 15 August 2026.
- Read platform-specific public SDK keys from Expo config: `REVENUECAT_IOS_API_KEY` and `REVENUECAT_ANDROID_API_KEY`. These are public app SDK keys, not secret server credentials.
- Expose optional `APP_TERMS_URL` and `APP_PRIVACY_URL` through Expo config for legal links.
- When `EAS_BUILD_PROFILE=production`, app configuration fails if either RevenueCat platform key or either legal URL is absent.
- Development, tests, web, and previews without a usable key receive an unavailable adapter. The UI explicitly says purchases are unavailable in that test build and keeps free play usable; it never simulates success.
- Tests inject a mock adapter directly. Production composition never imports or selects the mock adapter.

## Purchase adapter

`src/services/purchases/types.ts` owns provider-neutral types:

- entitlement: `unknown | free | premium`
- offering with stable package IDs and store-supplied title, product ID, price string, period, optional trial copy, and recommended flag
- classified failures: offline, configuration, empty offering, purchase, restore, and cancellation

`PurchasesAdapter` exposes only `configure`, `getCustomer`, `getOffering`, `purchase`, `restore`, and `subscribe`. The RevenueCat adapter maps SDK objects and error codes at this edge. No screen or Zustand store imports RevenueCat types.

The active entitlement identifier is exactly `premium`. Store prices and trial terms come only from RevenueCat packages; no numeric price is stored in source.

## State machine

`purchaseStore` contains:

- `status`: `unconfigured | loading | ready | offline | empty_offering | configuration_error | purchasing | success | cancelled | purchase_error | restoring | nothing_to_restore | restore_error`
- `entitlement`, `offering`, `lastSyncedAt`
- one `hydrate` operation and guarded `purchase`, `restore`, and `refresh` actions

Hydration configures the SDK and races the initial customer/offering fetch against a four-second timeout. App boot waits for this bounded attempt but always continues into the free experience. Customer updates refresh entitlement through one subscribed listener.

Purchase and restore buttons are locked while either operation is running. Cancellation is a neutral result, not an error. Premium becomes available only when a returned or freshly fetched customer record contains the verified `premium` entitlement. A successful transaction without that entitlement becomes a purchase error rather than optimistic access.

## User flow

1. A premium pack still opens its detail sheet first and shows two approved sample questions.
2. A free user sees `Unlock all packs`. Selecting it records the intended pack and opens `/premium?packId=<id>`.
3. A premium user sees `Choose <pack>` and goes directly to session setup.
4. The paywall presents the product promise, all store-returned plans, the annual/recommended plan selected by default when present, transparent trial/renewal copy, Restore, Terms, Privacy, and an immediate close action.
5. After verified purchase or restore, the selected premium pack is unlocked and the primary action continues to session setup.
6. Closing, offline, empty-offering, or configuration-error states return the user to free packs without blocking the app.

The recap gains one restrained contextual upsell for free users. It opens the same paywall without inventing a pack-specific promise.

## Paywall states

- Loading: clear progress copy and close action.
- Ready: selectable store packages and purchase CTA.
- Purchasing/restoring: keep the screen visible, announce busy state, disable duplicate actions.
- Success: concise confirmation and continue action.
- Cancelled: return to ready without a red alert or toast.
- Offline: explain that free decks still work and offer Retry.
- Empty offering: explain that plans are temporarily unavailable and offer Retry.
- Configuration error: identify a test-build/setup limitation without showing fake products.
- Purchase/restore error: keep the selected plan, show a recovery message, and offer Retry.
- Nothing to restore: neutral explanatory message while leaving purchase options available.

## Premium enforcement

The existing session engine remains the final pack-level guard. Session setup passes all premium pack IDs only when `purchaseStore.entitlement === 'premium'`; otherwise it redirects the selected premium pack to the paywall. UI state alone never grants access.

## Accessibility, layout, and privacy

- Every plan is a radio-like Pressable with selected/disabled semantics and at least a 48-point target.
- Purchase and restore operations expose busy state through the existing button primitive and an accessible status message.
- The screen scrolls on small devices, uses the existing responsive max width, semantic theme tokens, and logical content order for RTL.
- Close, Retry, Restore, Terms, and Privacy remain visible without delayed dismissal tactics.
- No player name, answer, question history, or custom identifier is sent to RevenueCat in PR 8. RevenueCat's anonymous app user ID is used.

## Testing

- Adapter mapping tests cover offerings, verified entitlement, cancellation, offline/configuration classification, purchase, restore, and listener cleanup.
- Store tests cover the full state graph, timeout, duplicate-action guards, verified-success rule, restore-empty, and non-blocking failure.
- Pack/session tests prove free users reach the paywall, premium users reach setup, and the engine still rejects unentitled premium packs.
- Paywall component tests cover every visible state, store-sourced pricing, plan selection, retry, restore, legal links, close, and post-success navigation.
- Existing full quality, content, Expo Doctor, and web export gates remain mandatory.

## External setup boundary

This PR can ship and be tested with injected adapters and RevenueCat Preview API behavior. Real-device purchase verification still requires a RevenueCat project with the `premium` entitlement, a current offering, store products, platform SDK keys, and a development/native build. Those external values are never committed.
