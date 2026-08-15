import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { useAppTheme } from '@/design';
import { captureException } from '@/services/crash/runtime';

type State = { failed: boolean };

function ErrorFallback({ retry }: { retry: () => void }) {
  const theme = useAppTheme();
  return (
    <View
      accessible
      accessibilityRole="alert"
      style={[styles.fallback, { backgroundColor: theme.colors.canvas }]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <AppText variant="h2">The cards slipped off the table.</AppText>
        <AppText tone="muted">
          Your answers were never recorded. Try returning to the game when you are ready.
        </AppText>
        <AppButton label="Try again" onPress={retry} />
      </View>
    </View>
  );
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, {
      boundary: 'root',
      component_stack_present: Boolean(info.componentStack),
    });
  }

  private retry = () => this.setState({ failed: false });

  render(): ReactNode {
    return this.state.failed ? <ErrorFallback retry={this.retry} /> : this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
});
