import React, { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import routes, { MY_EXTENSIONS } from '../../../routes';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stepper from '@akashaorg/design-system-core/lib/components/Stepper';
import ExtensionEditStep1Form from '@akashaorg/design-system-components/lib/components/ExtensionEditStep1Form';
import {
  transformSource,
  useAkashaStore,
  useRootComponentProps,
  useSaveImage,
  useValidateUniqueExtensionProp,
} from '@akashaorg/ui-awf-hooks';
import { Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { DRAFT_EXTENSIONS } from '../../../constants';
import { useAtom } from 'jotai';
import { AtomContext, FormData } from './main-page';

type ExtensionEditStep1PageProps = {
  extensionId: string;
};

export const ExtensionEditStep1Page: React.FC<ExtensionEditStep1PageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');

  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const showErrorNotification = React.useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  // fetch the draft extensions that are saved only on local storage
  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const formValue = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(extensionId)) || {};
    } catch (error) {
      showErrorNotification(error);
    }
  }, [extensionId, showErrorNotification]);

  const extensionData = draftExtensions.find(draftExtension => draftExtension.id === extensionId);

  const { image: logoImage, saveImage: saveLogoImage, loading: isSavingLogoImage } = useSaveImage();

  const {
    image: coverImage,
    saveImage: saveCoverImage,
    loading: isSavingCoverImage,
  } = useSaveImage();

  const isSavingImage = isSavingLogoImage || isSavingCoverImage;

  const defaultValues = useMemo(() => {
    return formValue.lastCompletedStep > 0 ? formValue : extensionData;
  }, [extensionData, formValue]);

  const formDefault = useMemo(() => {
    return {
      name: defaultValues?.name,
      displayName: defaultValues?.displayName,
      logoImage: defaultValues?.logoImage,
      coverImage: defaultValues?.coverImage,
    };
  }, [defaultValues]);

  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  const onSaveImageError = () => {
    showErrorNotification(t("The image wasn't uploaded correctly. Please try again!"));
  };

  const {
    loading: loadingAppInfo,
    error: appInfoQueryError,
    handleCheckExtProp,
    isDuplicateExtProp,
  } = useValidateUniqueExtensionProp(authenticatedDID, draftExtensions, extensionData.id);

  useEffect(() => {
    if (appInfoQueryError) {
      showErrorNotification(appInfoQueryError.message);
    }
  }, [appInfoQueryError, showErrorNotification]);

  return (
    <>
      <Stack padding={16} justify="center" align="center">
        <Stepper length={3} currentStep={formValue.lastCompletedStep + 1} />
      </Stack>
      <Stack spacing="gap-y-4">
        <Stack padding={16}>
          <Text variant="h5" weight="semibold" align="center">
            {t('Edit Extension Presentation')}
          </Text>
        </Stack>
        <ExtensionEditStep1Form
          extensionIdLabel={t('Extension ID')}
          extensionDisplayNameLabel={t('Extension Display Name')}
          defaultValues={formDefault}
          extensionType={extensionData?.applicationType}
          header={{
            coverImage: transformSource(coverImage || formDefault?.coverImage),
            logoImage: transformSource(logoImage || formDefault?.logoImage),
            dragToRepositionLabel: t('Drag the image to reposition'),
            cropErrorLabel: t('Unable to crop the image. Please try again!'),
            cancelLabel: t('Cancel'),
            deleteLabel: t('Delete'),
            saveLabel: t('Save'),
            logoPreviewTitle: t('Logo preview'),
            imageTitle: {
              logoImage: { label: t('Edit Logo') },
              coverImage: { label: t('Edit Cover') },
            },
            deleteTitle: {
              logoImage: { label: t('Delete Logo') },
              coverImage: { label: t('Delete Cover') },
            },
            confirmationLabel: {
              logoImage: t(`Are you sure you want to delete the extension's logo image?`),
              coverImage: t(`Are you sure you want to delete the extension's cover image?`),
            },
            isSavingImage,
            publicImagePath: '/images',
            logoGuidelines: {
              titleLabel: t('Logo guidelines'),
              guidelines: [
                t('Full square'),
                t('Non-transparent background'),
                t('Minimum dimensions: 112 x 112 px'),
                t('Formats: PNG, JPEG, or WebP'),
                t('sRGB color space'),
                t('Max size: 1.5 MB'),
              ],
              imageDescription: 'Recommended logo positioning',
            },
            onImageSave: (type, image) => {
              switch (type) {
                case 'logo-image':
                  saveLogoImage({ name: 'logo-image', image, onError: onSaveImageError });
                  break;
                case 'cover-image':
                  saveCoverImage({ name: 'cover-image', image, onError: onSaveImageError });
                  break;
              }
            },
            onImageDelete: () => {},
          }}
          handleCheckExtProp={handleCheckExtProp}
          isDuplicateExtProp={isDuplicateExtProp}
          loading={loadingAppInfo}
          cancelButton={{
            label: t('Cancel'),
            disabled: false,
            handleClick: () => {
              navigate({
                to: routes[MY_EXTENSIONS],
              });
            },
          }}
          nextButton={{
            label: t('Next'),
            handleClick: data => {
              const step1Data = {
                ...data,
                logoImage: logoImage || formDefault.logoImage,
                coverImage: coverImage || formDefault.coverImage,
              };
              setForm(prev => {
                return {
                  ...prev,
                  ...step1Data,
                  lastCompletedStep:
                    !formValue.lastCompletedStep || formValue.lastCompletedStep < 1
                      ? 1
                      : formValue.lastCompletedStep,
                };
              });
              navigate({
                to: '/edit-extension/$extensionId/step2',
              });
            },
          }}
        />
      </Stack>
    </>
  );
};
