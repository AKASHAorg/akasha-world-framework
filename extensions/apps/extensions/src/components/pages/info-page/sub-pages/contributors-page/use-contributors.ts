import { useAkashaStore, useProfilesList, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useCallback, useMemo, useRef } from 'react';
import { DRAFT_EXTENSIONS } from '../../../../../constants';
import {
  AkashaProfile,
  Extension,
  NotificationEvents,
  NotificationTypes,
} from '@akashaorg/typings/lib/ui';

interface IUseContributors {
  appName: string;
  publishedAppContributorsProfile?: AkashaProfile[];
}

export function useContributors({ appName, publishedAppContributorsProfile }: IUseContributors) {
  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = useRef(uiEvents);

  const showErrorNotification = useCallback((title: string, description?: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
        description,
      },
    });
  }, []);

  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const extensionData = useMemo(
    () => draftExtensions?.find(draftExtension => draftExtension.name === appName),
    [appName, draftExtensions],
  );

  const {
    profilesData: localExtensionContributors,
    loading,
    error,
  } = useProfilesList(extensionData?.contributors);

  return {
    localExtensionData: extensionData,
    contributorsProfile: publishedAppContributorsProfile ?? localExtensionContributors,
    error: publishedAppContributorsProfile ? null : error,
    loading: publishedAppContributorsProfile ? false : loading,
  };
}
