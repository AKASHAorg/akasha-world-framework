import * as React from 'react';
import { tw, apply } from '@twind/core';
import { ImageBlockGridItem } from '../ImageBlockGallery/image-block-grid-item';
import ImageOverlay from '../ImageOverlay';

export type ExtensionImageGalleryProps = {
  imageNotLoadedLabel: string;
  images: { height?: number; width?: number; src: string }[];
  showOverlay: boolean;
  toggleOverlay: () => void;
};

/**
 * Component used to present the images in the extension info section of the extension app
 * @param images - a list of images
 * @param toggleOverlay - handler that toggles the image overlay for zooming in
 * @param showOverlay - conditional rendering for the zooming overlay
 */
const ExtensionImageGallery: React.FC<ExtensionImageGalleryProps> = props => {
  const { imageNotLoadedLabel, images = [], showOverlay, toggleOverlay } = props;
  const [clickedImg, setClickedImg] = React.useState(null);

  const handleClickImage = (img: { src: string; size: { height: number; width: number } }) => {
    toggleOverlay();
    setClickedImg(img);
  };

  const gridStyle = apply(`grid grid-cols-6 gap-3`);

  const style = {
    gridColumnEnd: `span 2`,
    gridRowEnd: `span 2`,
  };

  return (
    <>
      <div className={images?.length === 1 ? tw('flex') : tw(`${gridStyle}`)}>
        {images?.map((image, index) => (
          <ImageBlockGridItem
            imageNotLoadedLabel={imageNotLoadedLabel}
            image={{ src: image.src, size: { width: image.width, height: image.height } }}
            key={index}
            handleClickImage={handleClickImage}
            images={images.map(img => ({
              src: img.src,
              size: { width: img.width, height: img.height },
            }))}
            gridStyle={style}
            aspectRatio="aspect-video"
          />
        ))}
      </div>
      {showOverlay && (
        <ImageOverlay
          images={images?.map(img => ({
            src: img.src,
            size: { width: img.width, height: img.height },
          }))}
          clickedImg={clickedImg ?? images[0]}
          closeModal={toggleOverlay}
        />
      )}
    </>
  );
};

export default ExtensionImageGallery;
