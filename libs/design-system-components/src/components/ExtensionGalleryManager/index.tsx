import React, { useRef } from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { GalleryImage, GalleryImageProps } from './gallery-image';
import { getGalleryState } from './get-gallery-state';
import { AppImageSource } from '@akashaorg/typings/lib/sdk/graphql-types-new';

type ActionButton = {
  label: string;
  disabled: boolean;
  handleClick: () => void;
};

export type Image = { id: string; name: string } & AppImageSource;

type ExtensionGalleryManagerProps = {
  galleryManagerTitle: string;
  galleryManagerDescription: string;
  uploadImagesLabel: string;
  imagesLabel: string;
  startUploadingLabel: string;
  emptyGalleryLabel: string;
  images: Image[];
  imageIdsWithError: string[];
  uploading: boolean;
  cancelButton: ActionButton;
  saveButton: ActionButton;
  maxGalleryImages: number;
  handleClickImage?: (image: Image) => void;
  onDelete: (image: Image) => void;
  onUploadImagesClick: (fileList: FileList) => void;
} & Pick<GalleryImageProps, 'uploadingLabel' | 'uploadingErrorLabel'>;

export const ExtensionGalleryManager: React.FC<ExtensionGalleryManagerProps> = props => {
  const {
    galleryManagerTitle,
    galleryManagerDescription,
    uploadImagesLabel,
    emptyGalleryLabel,
    images,
    imagesLabel,
    startUploadingLabel,
    imageIdsWithError,
    uploading,
    cancelButton,
    saveButton,
    uploadingLabel,
    uploadingErrorLabel,
    maxGalleryImages,
    handleClickImage,
    onDelete,
    onUploadImagesClick,
  } = props;
  const uploadInputRef = useRef(null);

  return (
    <Stack spacing="gap-y-4" customStyle="relative">
      <Stack direction="column" spacing="gap-y-4" padding="p-4">
        <Stack spacing="gap-y-2" direction="column" customStyle="">
          <Stack direction="row" spacing="gap-x-2" justify="between" align="center">
            <Text variant="h6">{galleryManagerTitle}</Text>
            <Button
              variant="text"
              size="md"
              label={uploadImagesLabel}
              onClick={() => {
                uploadInputRef.current.click();
              }}
              disabled={uploading}
            />
          </Stack>
          <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
            {galleryManagerDescription}
          </Text>
        </Stack>
        {images.length ? (
          <Stack customStyle="grid grid-cols-[repeat(auto-fill,_minmax(min(10rem,_100%),_1fr))] gap-4">
            {images.map(image => (
              <GalleryImage
                key={image.id}
                name={image.name}
                src={image.src}
                uploadingLabel={uploadingLabel}
                uploadingErrorLabel={uploadingErrorLabel}
                state={getGalleryState({
                  imageId: image.id,
                  uploading: uploading ? image.src.startsWith('blob:') : false,
                  imageIdsWithError,
                })}
                handleClickImage={() => handleClickImage(image)}
                onDelete={() => onDelete(image)}
              />
            ))}
          </Stack>
        ) : (
          <ErrorLoader
            title={<Text variant="h6">{emptyGalleryLabel}</Text>}
            details={
              <Button
                variant="primary"
                size="md"
                label={startUploadingLabel}
                onClick={() => {
                  uploadInputRef.current.click();
                }}
                customStyle="mt-4"
              />
            }
            type="list-not-available"
            noWrapperCard
          />
        )}
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={e => {
            onUploadImagesClick(e.target.files);
            uploadInputRef.current.value = '';
          }}
          multiple
          hidden
        />
      </Stack>
      <Stack
        background={{ light: 'white', dark: 'grey2' }}
        spacing="gap-y-4"
        customStyle="sticky bottom-0 rounded-b-2xl"
        fullWidth
      >
        <Divider />
        <Stack direction="row" align="center" spacing="gap-x-2" customStyle="px-4 mb-4">
          <Text variant="footnotes2" color={{ light: 'grey4', dark: 'grey6' }} weight="normal">
            {images.length}/{maxGalleryImages} {imagesLabel}
          </Text>
          <Button
            variant="text"
            size="md"
            label={cancelButton.label}
            disabled={cancelButton.disabled}
            onClick={cancelButton.handleClick}
            customStyle="ml-auto"
          />
          <Button
            variant="primary"
            size="md"
            loading={uploading}
            label={saveButton.label}
            disabled={saveButton.disabled}
            onClick={saveButton.handleClick}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ExtensionGalleryManager;
