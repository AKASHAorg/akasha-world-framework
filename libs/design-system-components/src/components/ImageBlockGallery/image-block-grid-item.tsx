import * as React from 'react';
import { apply, tw, tx } from '@twind/core';
import { DelayLoad } from '@akashaorg/design-system-core/lib/utils/delay-load';
import { type GalleryImage } from '@akashaorg/typings/lib/ui';

export interface IGridItemProps {
  image: GalleryImage;
  images: GalleryImage[];
  gridStyle: {
    gridColumnEnd: string;
    gridRowEnd: string;
  };
  aspectRatio?: 'aspect-video' | 'aspect-auto' | 'aspect-square';
  handleClickImage: (image: GalleryImage) => void;
}

export const ImageBlockGridItem: React.FC<IGridItemProps> = props => {
  const { image, images, gridStyle, aspectRatio = 'aspect-square', handleClickImage } = props;

  const imageSrc = React.useMemo(() => image, [image]);

  const [imgLoaded, setImgLoaded] = React.useState(false);

  const multipleImageStyle = apply`${images.length > 1 && aspectRatio}`;
  const heightStyle = apply`${images.length === 1 && 'max-h-40 sm:max-h-60'}`;

  return (
    <button
      className={tw('flex relative border(solid grey1) rounded')}
      style={gridStyle}
      onClick={ev => {
        if (handleClickImage && typeof handleClickImage === 'function' && imgLoaded) {
          handleClickImage(imageSrc);
        }
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      }}
    >
      {/* when we have a single image we need to keep the original aspect ratio,
          otherwise give images a 1:1 ratio */}
      <picture className={tw('flex w-full')}>
        <source srcSet={imageSrc?.originalSrc} />

        <img
          decoding="async"
          alt={imageSrc?.src}
          className={tx(`rounded object-cover w-full ${heightStyle} ${multipleImageStyle}`)}
          src={imageSrc?.src}
          onLoad={() => setImgLoaded(true)}
          hidden={!imgLoaded}
          height={images.length === 1 ? imageSrc?.size?.height : ''}
        />
      </picture>

      {!imgLoaded && (
        <DelayLoad>
          <div className={tw('flex')}>
            <img
              loading="lazy"
              decoding="async"
              alt={'placeholder'}
              className={tx(`rounded object-cover w-full ${heightStyle} ${multipleImageStyle}`)}
              src={'/images/image-placeholder.webp'}
              height={images.length === 1 ? imageSrc?.size?.height : ''}
            />
          </div>
        </DelayLoad>
      )}
    </button>
  );
};
