import React, { useCallback, useContext, useRef, useState } from 'react';
import ExtensionGalleryManager, {
  type Image,
} from '@akashaorg/design-system-components/lib/components/ExtensionGalleryManager';
import ImageOverlay from '@akashaorg/design-system-components/lib/components/ImageOverlay';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import { useTranslation } from 'react-i18next';
import {
  saveMediaFile,
  transformSource,
  useAkashaStore,
  useRootComponentProps,
} from '@akashaorg/ui-awf-hooks';
import { NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { useNavigate } from '@tanstack/react-router';
import { useGalleryImages } from './use-gallery-image';
import { useAtom } from 'jotai';
import { AtomContext, FormData } from '../main-page';
import { MAX_GALLERY_IMAGES } from '../../../../constants';

type ExtensionGalleryManagerPageProps = {
  extensionId: string;
};

export const ExtensionGalleryManagerPage: React.FC<ExtensionGalleryManagerPageProps> = ({
  extensionId,
}) => {
  const { t } = useTranslation('app-extensions');
  const { uiEvents } = useRootComponentProps();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image>(null);
  const [uploading, setUploading] = useState(false);
  const [imageIdsWithError, setImageIdsWithError] = useState<Set<string>>(new Set());
  const [showOverlay, setShowOverlay] = useState(false);

  const navigate = useNavigate();
  const uiEventsRef = useRef(uiEvents);
  const {
    data: { isAuthenticating },
  } = useAkashaStore();

  const { galleryImages, setGalleryImages } = useGalleryImages({ extensionId });
  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  const showErrorNotification = useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  if (isAuthenticating)
    return (
      <Card padding="py-4">
        <>
          {
            //@TODO replace with Loader component once its created
          }
          <Stack spacing="gap-y-5" align="center">
            <Spinner />
            <Text variant="button-md">{t('Loading gallery images')}</Text>
          </Stack>
        </>
      </Card>
    );

  const onDelete = (image: Image) => {
    setShowDeleteModal(true);
    setSelectedImage(image);
  };

  const onDeleteConfirmed = (imageId: string) => {
    setGalleryImages(galleryImages.filter(image => image.id !== imageId));
    onDeleteModalClose();
  };

  const onDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSelectedImage(null);
  };

  const onUploadImagesClick = (fileList: FileList) => {
    const numImagesCanBeUploaded = MAX_GALLERY_IMAGES - galleryImages.length;

    if (galleryImages.length + fileList.length > MAX_GALLERY_IMAGES) {
      showErrorNotification(t('Maximum image limit reached. Please delete some to add new ones.'));
    }

    if (numImagesCanBeUploaded > 0) {
      setGalleryImages([
        ...galleryImages,
        ...Array.from(fileList)
          .slice(0, numImagesCanBeUploaded)
          .map(image => ({
            id: crypto.randomUUID(),
            name: image.name,
            src: URL.createObjectURL(image),
            blob: image,
            width: 0,
            height: 0,
          })),
      ]);
    }
  };

  const onSave = async () => {
    const newImageIdsWithError: Set<string> = new Set();
    const imagesMap = new Map<string, Image>();

    //translate images array into images map
    galleryImages.forEach(image => {
      imagesMap.set(image.id, image);
    });

    setUploading(true);

    await Promise.allSettled(
      galleryImages.map(async image => {
        //upload blob images to w3.storage
        if (image.src?.startsWith('blob:')) {
          try {
            const mediaFile = await saveMediaFile({
              name: image.name,
              isUrl: false,
              content: image.blob,
            });

            //collect id's of images that failed to upload on w3.storage
            if (!mediaFile) {
              newImageIdsWithError.add(image.id);
              return;
            }

            const mediaUri = `ipfs://${mediaFile.CID}`;

            imagesMap.set(image.id, {
              ...image,
              height: mediaFile.size.height,
              width: mediaFile.size.width,
              src: mediaUri,
            });
          } catch (ex) {
            //collect id's of images that failed to upload on w3.storage
            newImageIdsWithError.add(image.id);
          }
        }
      }),
    );

    setUploading(false);

    setGalleryImages([
      ...imagesMap.values().map(image => {
        if (image.src.startsWith('ipfs://')) {
          const transformedSource = transformSource(image);
          return { ...image, src: transformedSource.src };
        }
        return image;
      }),
    ]);

    setImageIdsWithError(newImageIdsWithError);

    setForm(prev => ({
      ...prev,
      gallery: [
        ...imagesMap
          .values()
          //filter images which have been uploaded to w3.storage
          .filter(image => !newImageIdsWithError.has(image.id))
          .map(image => ({ src: image.src, width: image.width, height: image.height })),
      ],
    }));

    //if there are images which failed on upload show error notification
    if (newImageIdsWithError.size) {
      showErrorNotification(
        t('{{errorMessage}}', {
          errorMessage:
            newImageIdsWithError.size > 1
              ? 'Two or more images failed to upload.'
              : 'One image failed to upload.',
        }),
      );
      return;
    }

    navigate({
      to: '/edit-extension/$extensionId/step2',
      params: {
        extensionId,
      },
    });
  };

  const onCloseOverlay = () => {
    setShowOverlay(false);
  };

  const onImageClick = (image: Image) => {
    setSelectedImage(image);
    setShowOverlay(true);
  };

  return (
    <Card padding={0}>
      {galleryImages && (
        <>
          <ExtensionGalleryManager
            galleryManagerTitle={t('Extension Gallery')}
            galleryManagerDescription={t(
              'Tap on the images to set their order. Numbers will appear as you tap.',
            )}
            uploadImagesLabel={t('Upload images')}
            emptyGalleryLabel={t('Your gallery is empty.')}
            imagesLabel={t('images')}
            startUploadingLabel={t('Start uploading')}
            uploadingLabel={t('Uploading image')}
            uploadingErrorLabel={t('Image failed to upload')}
            uploading={uploading}
            images={galleryImages}
            imageIdsWithError={[...imageIdsWithError]}
            maxGalleryImages={MAX_GALLERY_IMAGES}
            cancelButton={{
              label: t('Cancel'),
              disabled: !!uploading,
              handleClick: () => {
                navigate({
                  to: '/edit-extension/$extensionId/step2',
                  params: {
                    extensionId,
                  },
                });
              },
            }}
            saveButton={{
              label: t('Save'),
              disabled: false,
              handleClick: onSave,
            }}
            onImageClick={onImageClick}
            onDelete={onDelete}
            onUploadImagesClick={onUploadImagesClick}
          />
          {showOverlay && (
            <ImageOverlay
              images={galleryImages.map(image => ({
                name: image.name,
                src: image.src,
                size: { width: image.width, height: image.height },
              }))}
              clickedImg={{
                name: selectedImage.name,
                src: selectedImage.src,
                size: { width: selectedImage.width, height: selectedImage.height },
              }}
              closeModal={onCloseOverlay}
            />
          )}
        </>
      )}
      <Modal
        title={{ label: t('Delete Image') }}
        show={showDeleteModal}
        onClose={onDeleteModalClose}
        actions={[
          {
            variant: 'text',
            label: t('Cancel'),
            onClick: onDeleteModalClose,
          },
          {
            variant: 'primary',
            label: t('Delete'),
            onClick: () => onDeleteConfirmed(selectedImage.id),
          },
        ]}
      >
        <Text variant="body1">
          {t('Are you sure you want to delete this image? This action cannot be undone.')}
        </Text>
      </Modal>
    </Card>
  );
};
