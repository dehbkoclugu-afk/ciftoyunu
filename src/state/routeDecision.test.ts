import { getLaunchRoute } from './routeDecision';

describe('getLaunchRoute', () => {
  it('renders nothing before hydration completes', () => {
    expect(getLaunchRoute('idle', false)).toBeNull();
    expect(getLaunchRoute('loading', false)).toBeNull();
  });

  it('routes first-time and returning users deterministically', () => {
    expect(getLaunchRoute('ready', false)).toBe('/onboarding/language');
    expect(getLaunchRoute('ready', true)).toBe('/home');
  });
});
