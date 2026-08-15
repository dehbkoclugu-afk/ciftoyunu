import { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useAppTheme } from '@/design';
import { AppErrorBoundary } from '@/components/feedback/AppErrorBoundary';
import { useNotificationRouting } from '@/services/notifications/observer';
import { useAppStore } from '@/state/appStore';
import { useSettingsStore } from '@/state/settingsStore';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const navigateNotification = (destination: '/daily') => router.push(destination);

function RootStack() {
  const theme = useAppTheme();

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.canvas },
          animation: 'fade',
        }}
      />
    </>
  );
}

function AppShell() {
  const hydrate = useAppStore((state) => state.hydrate);
  const bootStatus = useAppStore((state) => state.bootStatus);
  const themePreference = useSettingsStore((state) => state.theme);
  const forcedScheme = themePreference === 'system' ? undefined : themePreference;
  useNotificationRouting(navigateNotification);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (bootStatus === 'ready') {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [bootStatus]);

  return (
    <ThemeProvider {...(forcedScheme ? { forcedScheme } : {})}>
      <AppErrorBoundary>
        <RootStack />
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}
