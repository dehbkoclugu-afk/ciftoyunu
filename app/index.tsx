import { Redirect } from 'expo-router';

import { useAppStore } from '@/state/appStore';
import { getLaunchRoute } from '@/state/routeDecision';
import { useSettingsStore } from '@/state/settingsStore';

export default function LaunchScreen() {
  const bootStatus = useAppStore((state) => state.bootStatus);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const route = getLaunchRoute(bootStatus, onboardingCompleted);

  return route ? <Redirect href={route} /> : null;
}
