import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ExtensionEditStep2Form from '@akashaorg/design-system-components/lib/components/ExtensionEditStep2Form';
import {
  getMediaUrl,
  saveMediaFile,
  transformSource,
  useAkashaStore,
  useRootComponentProps,
} from '@akashaorg/ui-awf-hooks';
import {
  GalleryImage,
  NotificationEvents,
  NotificationTypes,
  Extension,
} from '@akashaorg/typings/lib/ui';
import { DRAFT_EXTENSIONS } from '../../../constants';
import { useAtom } from 'jotai';
import { AtomContext, FormData } from './main-page';

type ExtensionEditStep2PageProps = {
  extensionId: string;
};

export const ExtensionEditStep2Page: React.FC<ExtensionEditStep2PageProps> = ({ extensionId }) => {
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

  const extensionData = draftExtensions?.find(draftExtension => draftExtension.id === extensionId);

  const formValue = useMemo(
    () => JSON.parse(sessionStorage.getItem(extensionId)) || {},
    [extensionId],
  );

  const defaultValues = useMemo(() => {
    return formValue.lastCompletedStep > 1 ? formValue : extensionData;
  }, [extensionData, formValue]);

  const formDefault = useMemo(() => {
    return {
      nsfw: defaultValues?.nsfw,
      description: defaultValues?.description,
      gallery: defaultValues?.gallery,
      links: defaultValues?.links?.map((link, index) => ({ _id: index + 1, ...link })),
    };
  }, [defaultValues]);

  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    formDefault?.gallery?.map(img => {
      const imgWithGateway = transformSource(img);
      return {
        ...img,
        src: img?.src,
        displaySrc: imgWithGateway?.src,
        size: {
          height: img?.height,
          width: img?.width,
        },
      };
    }),
  );

  const onUpload = async (image: File | string, isUrl?: boolean) => {
    if (!image) return null;
    setUploading(true);

    const imageName = typeof image === 'string' ? image : image.name || 'extension-gallery-image';

    try {
      const mediaFile = await saveMediaFile({
        name: imageName,
        isUrl: isUrl || false,
        content: image,
      });
      setUploading(false);
      if (!mediaFile) return null;

      const mediaUri = `ipfs://${mediaFile.CID}`;

      const mediaUrl = getMediaUrl(mediaUri);

      const imageObj = {
        size: { height: mediaFile.size.height, width: mediaFile.size.width },
        displaySrc: mediaUrl.originLink || mediaUrl.fallbackLink,
        src: mediaUri,
        name: imageName,
        originalSrc: typeof image === 'string' ? image : URL.createObjectURL(image),
      };

      return imageObj;
    } catch (error) {
      setUploading(false);
      showErrorNotification(t("The image wasn't uploaded correctly. Please try again!"));
      return null;
    }
  };

  const uploadNewImage = async (image: File | string, isUrl?: boolean) => {
    const uploadedImage = await onUpload(image, isUrl);
    setGalleryImages(prev => [
      ...prev,
      {
        name: uploadedImage?.name,
        src: uploadedImage?.src,
        displaySrc: uploadedImage?.displaySrc,
        originalSrc: uploadedImage?.originalSrc,
        size: uploadedImage?.size,
      },
    ]);
  };

  const handleDeleteImage = (element: GalleryImage) => {
    const newImages = galleryImages.filter(image => image.src !== element.src);
    setGalleryImages(newImages);
  };

  return (
    <Stack spacing="gap-y-4">
      <Stack padding={16}>
        <Text variant="h5" weight="semibold" align="center">
          {t('Present your Extension')}
        </Text>
      </Stack>
      <ExtensionEditStep2Form
        nsfwFieldLabel={t('Extension NSFW?')}
        nsfwDescriptionLabel={t('Once you mark it as NSFW, you can’t change it back')}
        descriptionFieldLabel={t('Description')}
        descriptionPlaceholderLabel={t('What does this extension do?')}
        galleryFieldLabel={t('Gallery')}
        galleryDescriptionLabel={t(
          'Having a gallery to show off the extension will increase installs',
        )}
        usefulLinksFieldLabel={t('Useful Links')}
        usefulLinksDescriptionLabel={t(
          'Include any relevant links, such as documentation or contact information, that you believe will be helpful to others.',
        )}
        linkTitleLabel={t('Link')}
        linkPlaceholderLabel={t('Link title')}
        addLabel={t('Add')}
        uploading={uploading}
        handleImageUpload={uploadNewImage}
        handleImageDelete={handleDeleteImage}
        images={galleryImages}
        defaultValues={formDefault}
        cancelButton={{
          label: t('Back'),
          disabled: false,
          handleClick: () => {
            navigate({
              to: '/edit-extension/$extensionId/step1',
            });
          },
        }}
        nextButton={{
          label: t('Next'),
          handleClick: data => {
            const step2Data = {
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
                ...step2Data,
                lastCompletedStep:
                  !formValue.lastCompletedStep || formValue.lastCompletedStep < 2
                    ? 2
                    : formValue.lastCompletedStep,
              };
            });
            navigate({
              to: '/edit-extension/$extensionId/step3',
            });
          },
        }}
      />
    </Stack>
  );
};
