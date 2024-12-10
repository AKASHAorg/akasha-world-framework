import { useEffect, useState } from 'react';
import getSDK from '@akashaorg/core-sdk';

/**
 * Hook to enable notifications and observe signature propmpt result.
 * @example useNotifications hook
 * ```typescript
 * const { notificationsEnabled, previouslyEnabled, waitingForSignature, enableNotifications } = useNotifications();
 *
 * ```
 */
export function useNotifications() {
  const sdk = getSDK();

  const [previouslyEnabled, setPreviouslyEnabled] = useState(() =>
    sdk.services.common.notification.getNotificationsEnabledStatus(),
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    sdk.services.common.notification.checkIfNotificationsEnabled(),
  );

  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [waitingForSignature, setWaitingForSignature] = useState(false);

  // Initialise notificaitons readOnly client (without signature)
  useEffect(() => {
    sdk.services.common.notification
      .initialize({ readonly: true })
      .then(() => {
        setReadOnlyMode(true);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const enableNotifications = async () => {
    setWaitingForSignature(true);
    let enabled: boolean;
    try {
      await sdk.services.common.notification.initialize({ readonly: false });
      enabled = true;
      setNotificationsEnabled(true);
      setPreviouslyEnabled(true);
      sdk.services.common.notification.setNotificationsEnabledStatus(true);
    } catch (error) {
      console.error(error);
      enabled = false;
      setNotificationsEnabled(false);
    } finally {
      setReadOnlyMode(false);
      setWaitingForSignature(false);
    }
    return enabled;
  };

  return {
    notificationsEnabled,
    previouslyEnabled,
    waitingForSignature,
    readOnlyMode,
    enableNotifications,
  };
}
