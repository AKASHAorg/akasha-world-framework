import React, { Fragment, useState } from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import ImageOverlay from '../../ImageOverlay';
import { PlusIcon } from '@heroicons/react/24/outline';
import { type GalleryImage } from '@akashaorg/typings/lib/ui';

const MAX_IMAGES_DISPLAY = 3;

export type GalleryProps = {
  galleryFieldLabel: string;
  galleryDescriptionLabel: string;
  addLabel: string;
  updateGalleryLabel: string;
  imagesUploadedLabel: string;
  images: GalleryImage[];
  maxGalleryImages: number;
  handleMediaClick: () => void;
};

export const Gallery: React.FC<GalleryProps> = props => {
  const {
    galleryFieldLabel,
    galleryDescriptionLabel,
    addLabel,
    updateGalleryLabel,
    imagesUploadedLabel,
    images,
    maxGalleryImages,
    handleMediaClick,
  } = props;

  const galleryHasImages = images?.length > 0;
  const displayImages = galleryHasImages ? images.slice(0, MAX_IMAGES_DISPLAY) : [];
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage>(null);

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  const handleClickImage = (image: GalleryImage) => {
    setShowOverlay(true);
    setSelectedImage(image);
  };

  return (
    <Stack spacing="gap-y-4" direction="column">
      <Stack spacing="gap-y-2" direction="column">
        <Stack direction="row" spacing="gap-x-2" justify="between" align="center">
          <Text variant="h6" as="label">
            {galleryFieldLabel}
          </Text>
          <Button
            variant="text"
            size="md"
            {...(!galleryHasImages && { icon: <PlusIcon />, iconDirection: 'left' })}
            label={galleryHasImages ? updateGalleryLabel : addLabel}
            onClick={handleMediaClick}
          />
        </Stack>
        <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
          {galleryDescriptionLabel}
        </Text>
      </Stack>
      {galleryHasImages && (
        <Stack customStyle="grid grid-cols-[repeat(auto-fill,_minmax(min(10rem,_100%),_1fr))] gap-4">
          {displayImages.map((image, index) => (
            <Stack
              key={index}
              customStyle="w-[6.125rem] h-[6.125rem] sm:w-[10.625rem] sm:h-[10.625rem] overflow-hidden object-cover rounded-lg cursor-pointer"
            >
              <Image
                alt={image.name}
                src={image.originalSrc || image.displaySrc || image.src}
                onClick={() => handleClickImage(image)}
                customStyle="object-cover w-full h-full"
                showLoadingIndicator
              />
              {showOverlay && (
                <ImageOverlay
                  images={displayImages.map(image => ({
                    name: image.name,
                    size: image.size,
                    src: image.originalSrc || image.displaySrc || image.src,
                  }))}
                  clickedImg={{
                    name: selectedImage.name,
                    size: selectedImage.size,
                    src: selectedImage.originalSrc || selectedImage.displaySrc || selectedImage.src,
                  }}
                  closeModal={handleCloseOverlay}
                />
              )}
            </Stack>
          ))}
        </Stack>
      )}
      <Text variant="footnotes2" color={{ light: 'grey4', dark: 'grey6' }} weight="normal">
        {images?.length ?? 0}/{maxGalleryImages} {imagesUploadedLabel}
      </Text>
    </Stack>
  );
};
