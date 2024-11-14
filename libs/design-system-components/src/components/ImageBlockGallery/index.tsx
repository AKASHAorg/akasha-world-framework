import * as React from 'react';
import { tw, apply } from '@twind/core';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { ArrowPathIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { ImageBlockGridItem } from './image-block-grid-item';
import ImageOverlay from '../ImageOverlay';
import { type GalleryImage } from '@akashaorg/typings/lib/ui';

export interface IImageGallery {
  imageNotLoadedLabel: string;
  images: GalleryImage[];
  uploading?: boolean;
}

/**
 * Component used to present the images in the beam card and beam editor image content block
 * @param images - a list of images
 * @param uploading - used to apply a different style in the editor when a  new image is uploaded
 */
const ImageBlockGallery: React.FC<IImageGallery> = props => {
  const { imageNotLoadedLabel, images, uploading } = props;

  const [showOverlay, setShowOverlay] = React.useState(false);
  const [clickedImg, setClickedImg] = React.useState(null);

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  const handleClickImage = (img: GalleryImage) => {
    setShowOverlay(true);
    setClickedImg(img);
  };

  const gridStyle = apply(`grid grid-cols-6 gap-1`);

  const getGridSpan = () => {
    switch (uploading ? images.length + 1 : images.length) {
      case 1:
        return 6;
      case 3:
        return 2;
      default:
        return 3;
    }
  };

  const style = {
    gridColumnEnd: `span ${getGridSpan()}`,
    gridRowEnd: `span ${getGridSpan()}`,
  };

  return (
    <>
      <div className={images.length === 1 ? tw('flex') : tw(`${gridStyle}`)}>
        {images.map((image, index) => (
          <ImageBlockGridItem
            imageNotLoadedLabel={imageNotLoadedLabel}
            image={image}
            key={index}
            handleClickImage={handleClickImage}
            images={images}
            gridStyle={style}
          />
        ))}
        {uploading && (
          <div className={tw('flex relative border(solid grey1) rounded')} style={style}>
            <Stack
              customStyle={`rounded h-full w-[${images[0]?.size?.height}px] max-w-max aspect-square `}
              justify="center"
              align="center"
              background={{ light: 'grey8', dark: 'grey5' }}
            >
              <Icon icon={<ArrowPathIcon />} rotateAnimation />
            </Stack>
          </div>
        )}
      </div>
      {showOverlay && (
        <ImageOverlay images={images} clickedImg={clickedImg} closeModal={handleCloseOverlay} />
      )}
    </>
  );
};

export default ImageBlockGallery;
