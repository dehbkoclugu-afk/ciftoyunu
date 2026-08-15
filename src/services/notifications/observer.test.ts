import * as Notifications from 'expo-notifications';
import { renderHook } from '@testing-library/react-native';

import { track } from '@/services/analytics/runtime';

import { useNotificationRouting } from './observer';

jest.mock('@/services/analytics/runtime', () => ({ track: jest.fn() }));

describe('notification routing observer', () => {
  it('routes only the controlled daily destination', async () => {
    const navigate = jest.fn();
    await renderHook(() => useNotificationRouting(navigate));
    const listener = jest.mocked(Notifications.addNotificationResponseReceivedListener).mock
      .calls[0]?.[0];
    listener?.({
      notification: { request: { content: { data: { destination: 'daily' } } } },
    } as never);
    listener?.({
      notification: { request: { content: { data: { destination: '/premium' } } } },
    } as never);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/daily');
    expect(track).toHaveBeenCalledWith('notification_opened', {
      destination: 'daily',
      source: 'response',
    });
  });
});
