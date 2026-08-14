export type BootStatus = 'idle' | 'loading' | 'ready';
export type LaunchRoute = '/onboarding/language' | '/home';

export function getLaunchRoute(
  status: BootStatus,
  onboardingCompleted: boolean,
): LaunchRoute | null {
  if (status !== 'ready') return null;
  return onboardingCompleted ? '/home' : '/onboarding/language';
}
