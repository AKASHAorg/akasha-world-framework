import { useAkashaStore, useProfilesList, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState<AkashaProfile[]>([]);
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
  const extensionData = draftExtensions?.find(draftExtension => draftExtension.name === appName);

  const {
    profilesData,
    loading: loadingProfilesData,
    error: errorProfilesData,
  } = useProfilesList(extensionData?.contributors);

  useEffect(() => {
    //the order of the conditionals is important
    if (publishedAppContributorsProfile?.length > 0) {
      setContributors(publishedAppContributorsProfile);
      return;
    }

    if (loadingProfilesData) {
      setLoading(true);
      return;
    }

    if (errorProfilesData) {
      setError(errorProfilesData);
      return;
    }

    setContributors(profilesData);
    setLoading(false);
  }, [errorProfilesData, loadingProfilesData, profilesData, publishedAppContributorsProfile]);

  return { localExtensionData: extensionData, contributors, error, loading };
}
