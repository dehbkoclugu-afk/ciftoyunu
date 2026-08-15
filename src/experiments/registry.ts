export const experimentRegistry = {
  'paywall.freeCards60vs120': { enabled: false, control: '60', variant: '120' },
  'paywall.trial3vs7': { enabled: false, control: '3', variant: '7' },
  'paywall.annualFirst': { enabled: false, control: 'control', variant: 'annual_first' },
  'onboarding.showSampleCard': { enabled: false, control: 'hidden', variant: 'shown' },
  'home.dailyQuestion': { enabled: false, control: 'hidden', variant: 'shown' },
  'session.specialCardRate': { enabled: false, control: 'standard', variant: 'high' },
} as const;

export type ExperimentKey = keyof typeof experimentRegistry;

export const experimentKeys = Object.keys(experimentRegistry) as ExperimentKey[];
