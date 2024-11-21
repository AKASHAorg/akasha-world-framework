import React, { useMemo, useRef } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import appRoutes, { EDIT_PUBLISHED_EXTENSION, MY_EXTENSIONS } from '../../../routes';
import { useTranslation } from 'react-i18next';
import {
  transformSource,
  useAkashaStore,
  useRootComponentProps,
  useSaveImage,
} from '@akashaorg/ui-awf-hooks';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { useGetAppsByIdQuery, useUpdateAppMutation } from '@akashaorg/ui-awf-hooks/lib/generated';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ExtensionEditPublishedForm from '@akashaorg/design-system-components/lib/components/ExtensionEditPublishedForm';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useNavigate } from '@tanstack/react-router';
import getSDK from '@akashaorg/core-sdk';
import { ExtType, SubmitType } from '../../app-routes';
import { selectAppData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-id-query';
import { MAX_GALLERY_IMAGES } from '../../../constants';

type EditPublishedExtensionPageProps = {
  extensionId: string;
};

export const EditPublishedExtensionPage: React.FC<EditPublishedExtensionPageProps> = ({
  extensionId,
}) => {
  const { t } = useTranslation('app-extensions');

  const { baseRouteName, getCorePlugins } = useRootComponentProps();
  const navigate = useNavigate();
  const navigateTo = getCorePlugins().routing.navigateTo;

  const sdk = useRef(getSDK());

  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

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

  const {
    data: extensionReq,
    loading: extensionDataLoading,
    error: extensionDataError,
  } = useGetAppsByIdQuery({ variables: { id: extensionId } });

  const extensionData = selectAppData(extensionReq);

  const formDefault = {
    logoImage: extensionData?.logoImage,
    coverImage: extensionData?.coverImage,
    description: extensionData?.description,
    gallery: extensionData?.gallery,
    links: extensionData?.links,
  };

  const [updateAppMutation, { loading: loadingAppMutation }] = useUpdateAppMutation({
    context: { source: sdk.current.services.gql.contextSources.composeDB },
    onCompleted: () => {
      navigate({
        to: '/post-publish/$extensionId',
        search: { type: SubmitType.EXTENSION },
        params: { extensionId },
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
      coverImage: formData?.coverImage,
      description: formData?.description,
      displayName: formData?.displayName,
      gallery: formData?.gallery,
      links: formData?.links,
      logoImage: formData?.logoImage,
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
    const gallery = formDefault?.gallery;
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
  }, [formDefault?.gallery, showErrorNotification]);

  const onSaveImageError = () => {
    showErrorNotification(t("The image wasn't uploaded correctly. Please try again!"));
  };

  const handleConnectButtonClick = () => {
    navigateTo?.({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: (routes: Record<string, string>) => {
        return `${routes.Connect}?${new URLSearchParams({
          redirectTo: `${baseRouteName}/${appRoutes[EDIT_PUBLISHED_EXTENSION]}/${extensionId}`,
        }).toString()}`;
      },
    });
  };

  if (!authenticatedDID) {
    return (
      <ErrorLoader
        type="not-authenticated"
        title={`${t('Uh-oh')}! ${t('You are not connected')}!`}
        details={`${t('To check your extensions you must be connected')} ⚡️`}
      >
        <Button
          variant="primary"
          size="md"
          label={t('Connect')}
          onClick={handleConnectButtonClick}
        />
      </ErrorLoader>
    );
  }

  if (extensionDataLoading) {
    return (
      <Card>
        <Stack align="center" justify="center">
          <Spinner loadingLabel={t('Loading edit form')} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding={0}>
      <ExtensionEditPublishedForm
        extensionInformationLabel={t('Extension information')}
        extensionInformationDescriptionLabel={t(
          'The extension is already published, so this information cannot be edited.',
        )}
        extensionIdLabel={t('Extension ID')}
        extensionDisplayNameLabel={t('Extension Display Name')}
        extensionLicenseLabel={t('License Type')}
        extensionType={extensionData?.applicationType}
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
        }}
        maxGalleryImages={MAX_GALLERY_IMAGES}
        loading={loadingAppMutation}
        handleManageGalleryClick={formData => {
          //   storeFormData(formData);
          navigate({
            to: '/edit-extension/$extensionId/gallery-manager',
            search: { type: ExtType.PUBLISHED },
            params: {
              extensionId,
            },
          });
        }}
        header={{
          coverImage: transformSource(coverImage || extensionData?.coverImage),
          logoImage: transformSource(logoImage || extensionData?.logoImage),
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
              to: appRoutes[MY_EXTENSIONS],
            });
          },
        }}
        nextButton={{
          label: t('Submit Changes'),
          handleClick: handleClickSubmit,
        }}
      />
    </Card>
  );
};
