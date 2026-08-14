import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_NAME ?? 'Project Duo',
  slug: 'project-duo',
  scheme: 'projectduo',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.ceystudio.projectduo',
    supportsTablet: true,
  },
  android: {
    package: 'com.ceystudio.projectduo',
    predictiveBackGestureEnabled: true,
  },
  web: {
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appName: process.env.APP_NAME ?? 'Project Duo',
  },
});
