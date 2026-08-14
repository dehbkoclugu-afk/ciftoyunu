import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { resolveTheme, type AppTheme } from './themes';

const ThemeContext = createContext<AppTheme | null>(null);

type ThemeProviderProps = PropsWithChildren<{
  forcedScheme?: 'light' | 'dark';
}>;

export function ThemeProvider({ children, forcedScheme }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const theme = useMemo(
    () => resolveTheme(forcedScheme ?? systemScheme),
    [forcedScheme, systemScheme],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }

  return theme;
}
