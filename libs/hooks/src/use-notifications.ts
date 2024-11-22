import { useState } from 'react';
import getSDK from '@akashaorg/core-sdk';

/**
 * Hook to enable notifications and observe signature propmpt result.
 * @example useNotifications hook
 * ```typescript
 * const { notificationsEnabled, loading, enableNotifications } = useNotifications();
 *
 * ```
 */
export function useNotifications() {
  const sdk = getSDK();

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    sdk.services.common.notification.checkIfNotificationsEnabled(),
  );

  const [waitingForSignature, setWaitingForSignature] = useState(false);

  const enableNotifications = async () => {
    setWaitingForSignature(true);
    let enabled: boolean;
    try {
      await sdk.services.common.notification.initialize({ readonly: false });
      enabled = true;
      setNotificationsEnabled(true);
    } catch (error) {
      enabled = false;
      setNotificationsEnabled(false);
    } finally {
      setWaitingForSignature(false);
    }
    return enabled;
  };

  return { notificationsEnabled, waitingForSignature, enableNotifications };
}
