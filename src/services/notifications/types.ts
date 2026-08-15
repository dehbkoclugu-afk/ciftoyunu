export type NotificationPermission = 'granted' | 'denied' | 'blocked' | 'unavailable';

export type NotificationResponseData = Readonly<Record<string, unknown>>;

export type NotificationAdapter = {
  getPermission: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  requestPermission: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  prepareChannel: () => Promise<void>;
  cancel: (identifier: string) => Promise<void>;
  scheduleDaily: (hour: number, minute: number) => Promise<string>;
  getLastResponseData: () => NotificationResponseData | null;
  subscribeToResponses: (listener: (data: NotificationResponseData) => void) => () => void;
};
