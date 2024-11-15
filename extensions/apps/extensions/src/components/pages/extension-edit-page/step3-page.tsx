import React, { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stepper from '@akashaorg/design-system-core/lib/components/Stepper';
import ExtensionEditStep3Form from '@akashaorg/design-system-components/lib/components/ExtensionEditStep3Form';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { transformSource, useProfilesList } from '@akashaorg/ui-awf-hooks';
import { DRAFT_EXTENSIONS, MAX_CONTRIBUTORS_DISPLAY } from '../../../constants';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { AtomContext } from './main-page';
import { useAtom } from 'jotai';

type ExtensionEditStep3PageProps = {
  extensionId: string;
};

export const ExtensionEditStep3Page: React.FC<ExtensionEditStep3PageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');
  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const showNotification = React.useCallback(
    (type: NotificationTypes, title: string, description?: string) => {
      uiEventsRef.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type,
          title,
          description,
        },
      });
    },
    [],
  );

  // fetch the draft extensions that are saved only on local storage
  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showNotification(NotificationTypes.Error, error);
    }
  }, [authenticatedDID, showNotification]);

  const extensionData = draftExtensions.find(draftExtension => draftExtension.id === extensionId);

  const formValue = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(extensionId)) || {};
    } catch (error) {
      showNotification(NotificationTypes.Error, error);
    }
  }, [extensionId, showNotification]);

  const defaultValues = useMemo(() => {
    return formValue.lastCompletedStep > 2 ? formValue : extensionData;
  }, [extensionData, formValue]);

  const defaultContributorsDIDs = useMemo(() => {
    return formValue.lastCompletedStep > 2 ? formValue?.contributors : extensionData?.contributors;
  }, [extensionData, formValue]);

  const {
    profilesData,
    loading: loadingProfilesData,
    error: errorProfilesData,
  } = useProfilesList(defaultContributorsDIDs);

  const formDefault = useMemo(() => {
    return {
      license: defaultValues?.license,
      contributors: defaultValues?.contributors,
      keywords: defaultValues?.keywords,
    };
  }, [defaultValues]);

  const handleUpdateExtension = step3Data => {
    const newDraftExtensions = draftExtensions.map(oldDraftExt =>
      oldDraftExt.id === extensionId ? { ...oldDraftExt, ...formValue, ...step3Data } : oldDraftExt,
    );
    localStorage.setItem(
      `${DRAFT_EXTENSIONS}-${authenticatedDID}`,
      JSON.stringify(newDraftExtensions),
    );
    sessionStorage.removeItem(extensionId);

    showNotification(
      NotificationTypes.Success,
      t('Extension Info Updated'),
      t('{{extensionName}} updated succesfully', { extensionName: formValue.name }),
    );

    navigate({
      to: '/my-extensions',
    });
  };

  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  useEffect(() => {
    // since adding the contributors is not part of the form steps anymore
    // we need to initialise the form value with the locally saved contributors
    // only before the user hasn't changed the added contributors in the
    // contributors page
    if (extensionData?.contributors?.length > 0 && formValue?.contributors?.length === 0) {
      setForm(prev => {
        return { ...prev, contributors: extensionData?.contributors };
      });
    }
  }, [extensionData?.contributors]);

  const handleNavigateToContributorsPage = data => {
    setForm(prev => {
      return {
        ...prev,
        // since we are saving the form state also at this step we need to update
        // this, so when the user gets back to the form the data that the user last entered
        // is prefilled
        lastCompletedStep: 3,
        ...data,
      };
    });
    navigate({ to: '/edit-extension/$extensionId/contributors', params: { extensionId } });
  };

  return (
    <>
      <Stack padding={16} justify="center" align="center">
        <Stepper length={3} currentStep={formValue.lastCompletedStep + 1} />
      </Stack>
      <Stack spacing="gap-y-4">
        <Stack padding={16}>
          <Text variant="h5" weight="semibold" align="center">
            {t('Present your Extension')}
          </Text>
        </Stack>
        <ExtensionEditStep3Form
          addLabel={t('Add')}
          addAndEditLabel={t('Add & Edit')}
          licenseFieldLabel={t('License')}
          licenseOtherPlaceholderLabel={t('Please specify your license type')}
          collaboratorsFieldLabel={t('Contributors')}
          collaboratorsDescriptionLabel={t('Add people who helped you create the extension')}
          moreLabel={t('more')}
          tagsLabel={t('Tags')}
          tagsDescriptionLabel={t('Adding tags increases your extensions discoverability.')}
          addTagsPlaceholderLabel={t('Type a tag and press space, comma or enter')}
          tagsAddedLabel={t('tags added')}
          noteLabel={t('Important note')}
          noteDescriptionLabel={t(
            'Extensions that are saved locally will be lost if cache is cleared or if accessed from a different device.',
          )}
          defaultValues={formDefault}
          contributorsProfiles={profilesData}
          errorProfilesData={errorProfilesData}
          loadingProfilesData={loadingProfilesData}
          errorProfilesDataLabel={t('There was an error loading the contributors')}
          maxContributorsDisplay={MAX_CONTRIBUTORS_DISPLAY}
          transformSource={transformSource}
          handleNavigateToContributorsPage={handleNavigateToContributorsPage}
          cancelButton={{
            label: t('Back'),
            disabled: false,
            handleClick: () => {
              navigate({
                to: '/edit-extension/$extensionId/step2',
              });
            },
          }}
          nextButton={{
            label: t('Save'),
            handleClick: data => {
              handleUpdateExtension(data);
            },
          }}
        />
      </Stack>
    </>
  );
};
