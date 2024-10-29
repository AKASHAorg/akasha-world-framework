import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ExtensionEditStep3Form from '@akashaorg/design-system-components/lib/components/ExtensionEditStep3Form';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { transformSource, useProfilesList } from '@akashaorg/ui-awf-hooks';
import { DRAFT_EXTENSIONS } from '../../../constants';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { AtomContext } from './main-page';
import { useAtom } from 'jotai';
import Stepper from '@akashaorg/design-system-core/lib/components/Stepper';

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

  const formValue = useMemo(
    () => JSON.parse(sessionStorage.getItem(extensionId)) || {},
    [extensionId],
  );

  const defaultValues = useMemo(() => {
    return formValue.lastCompletedStep > 2 ? formValue : extensionData;
  }, [extensionData, formValue]);

  const formDefault = useMemo(() => {
    return {
      license: defaultValues?.license,
      contributors: defaultValues?.contributors,
      keywords: defaultValues?.keywords,
    };
  }, [defaultValues]);

  const { profilesData } = useProfilesList(defaultValues?.contributors);

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

  const handleNavigateToContributorsPage = data => {
    setForm(prev => {
      return {
        ...prev,
        data,
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
