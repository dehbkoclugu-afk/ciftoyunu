export type CrashContext = Readonly<Record<string, string | number | boolean>>;

export type CrashAdapter = {
  captureException: (error: unknown, context?: CrashContext) => void;
  close?: () => Promise<void> | void;
};
