import { useLocalSearchParams } from 'expo-router';

import { PaywallScreen } from '@/features/paywall/PaywallScreen';

export default function PremiumRoute() {
  const { packId } = useLocalSearchParams<{ packId?: string }>();
  return <PaywallScreen {...(typeof packId === 'string' ? { packId } : {})} />;
}
