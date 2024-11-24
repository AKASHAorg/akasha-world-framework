import React, { useContext, useMemo, useRef } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { useTranslation } from 'react-i18next';
import { transformSource, useRootComponentProps, useSaveImage } from '@akashaorg/ui-awf-hooks';
import { useGetAppsByIdQuery, useUpdateAppMutation } from '@akashaorg/ui-awf-hooks/lib/generated';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ExtensionEditPublishedForm, {
  ExtensionEditPublishedFormValues,
} from '@akashaorg/design-system-components/lib/components/ExtensionEditPublishedForm';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useNavigate } from '@tanstack/react-router';
import getSDK from '@akashaorg/core-sdk';
import { ExtType, SubmitType } from '../../app-routes';
import { selectAppData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-id-query';
import { MAX_GALLERY_IMAGES } from '../../../constants';
import { AtomContext, formDefaultData } from './main-page';
import { useAtom } from 'jotai';

type EditPublishedExtensionPageProps = {
  extensionId: string;
};

export const EditPublishedExtensionPage: React.FC<EditPublishedExtensionPageProps> = ({
  extensionId,
}) => {
  const { t } = useTranslation('app-extensions');

  const navigate = useNavigate();

  const sdk = useRef(getSDK());

  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const showErrorNotification = React.useCallback((title: string, description?: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
        description,
      },
    });
  }, []);

  const formValue = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(extensionId)) || {};
    } catch (error) {
      showErrorNotification(error);
    }
  }, [extensionId, showErrorNotification]);

  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  const storeFormData = (data: ExtensionEditPublishedFormValues) => {
    const formData = {
      ...data,
      gallery: galleryImages?.map(galleryImage => {
        return {
          width: galleryImage.size?.width,
          height: galleryImage.size?.height,
          src: galleryImage.src,
        };
      }),
    };
    setForm(prev => {
      return {
        ...prev,
        ...formData,
      };
    });
  };

  const {
    data: extensionReq,
    loading: extensionDataLoading,
    error: extensionDataError,
  } = useGetAppsByIdQuery({ variables: { id: extensionId } });

  const extensionData = selectAppData(extensionReq);

  const defaultValues = useMemo(() => {
    return formValue.dataSavedToForm ? formValue : extensionData;
  }, [extensionData, formValue]);

  const formDefault = useMemo(() => {
    return {
      logoImage: defaultValues?.logoImage,
      coverImage: defaultValues?.coverImage,
      description: defaultValues?.description,
      gallery: defaultValues?.gallery,
      links: defaultValues?.links,
    };
  }, [defaultValues]);

  const [updateAppMutation, { loading: loadingAppMutation }] = useUpdateAppMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
    onCompleted: () => {
      setForm(prev => {
        return { ...prev, ...formDefaultData };
      });
      navigate({
        to: '/info/$appId',
        params: { appId: extensionId },
      });
    },
    onError: error => {
      showErrorNotification(
        `${t(`Something went wrong when updating the extension`)}.`,
        error.message,
      );
    },
  });

  const handleClickSubmit = formData => {
    const extData = {
      logoImage: formData?.logoImage,
      coverImage: formData?.coverImage,
      description: formData?.description,
      gallery: formData?.gallery,
      links: formData?.links,
    };
    updateAppMutation({
      variables: {
        i: {
          id: extensionData?.id,
          content: extData,
        },
      },
    });
  };

  const { image: logoImage, saveImage: saveLogoImage, loading: isSavingLogoImage } = useSaveImage();

  const {
    image: coverImage,
    saveImage: saveCoverImage,
    loading: isSavingCoverImage,
  } = useSaveImage();

  const isSavingImage = isSavingLogoImage || isSavingCoverImage;

  const galleryImages = useMemo(() => {
    const gallery = Array.isArray(formValue?.gallery) ? formValue.gallery : formDefault?.gallery;
    return gallery?.map(img => {
      let imgWithGateway = null;
      try {
        imgWithGateway = transformSource(img);
      } catch (error) {
        showErrorNotification((error satisfies Error).message ?? error);
      }
      return {
        ...img,
        src: img?.src,
        displaySrc: imgWithGateway?.src,
        size: {
          height: img?.height,
          width: img?.width,
        },
      };
    });
  }, [formDefault?.gallery, formValue.gallery, showErrorNotification]);

  const onSaveImageError = () => {
    showErrorNotification(t("The image wasn't uploaded correctly. Please try again!"));
  };

  if (extensionDataError) {
    return (
      <ErrorLoader
        type="script-error"
        title={t('Error loading extension data')}
        details={extensionDataError.message}
      />
    );
  }

  if (extensionDataLoading) {
    return (
      <Card>
        <Stack align="center" justify="center" spacing="gap-2" customStyle="h-full md:h-[563px]">
          <Icon
            icon={<ArrowPathIcon />}
            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
            size="lg"
          />
          <Text variant="body2" weight="bold">
            {t('Loading edit form')}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <ExtensionEditPublishedForm
      extensionInformationLabel={t('Extension information')}
      extensionInformationDescriptionLabel={t(
        'The extension is already published, so this information cannot be edited.',
      )}
      extensionIdLabel={t('Extension ID')}
      extensionDisplayNameLabel={t('Extension Display Name')}
      extensionLicenseLabel={t('License Type')}
      descriptionFieldLabel={t('Description')}
      descriptionPlaceholderLabel={t('What does this extension do?')}
      galleryFieldLabel={t('Gallery')}
      galleryDescriptionLabel={t(
        'The first three images, based on your order, will be featured on the main extension card.',
      )}
      usefulLinksFieldLabel={t('Useful Links')}
      usefulLinksDescriptionLabel={t(
        'Include any relevant links, such as documentation or contact information, that you believe will be helpful to others.',
      )}
      linkTitleLabel={t('Link')}
      linkPlaceholderLabel={t('Link title')}
      addLabel={t('Add')}
      updateGalleryLabel={t('Update gallery')}
      imagesUploadedLabel={t('images uploaded')}
      images={galleryImages}
      defaultValues={formDefault}
      displayOnlyValues={{
        name: extensionData?.name,
        displayName: extensionData?.displayName,
        license: extensionData?.license,
        applicationType: extensionData?.applicationType,
        nsfw: extensionData?.nsfw,
      }}
      maxGalleryImages={MAX_GALLERY_IMAGES}
      loading={loadingAppMutation}
      handleManageGalleryClick={formData => {
        storeFormData(formData);
        navigate({
          to: '/edit-published-extension/$extensionId/gallery-manager',
          search: { type: ExtType.PUBLISHED },
          params: {
            extensionId,
          },
        });
      }}
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
      cancelButton={{
        label: t('Cancel'),
        disabled: false,
        handleClick: () => {
          navigate({
            to: '/my-extensions',
          });
        },
      }}
      nextButton={{
        label: t('Submit Changes'),
        handleClick: handleClickSubmit,
      }}
    />
  );
};
