import * as React from 'react';
import { tw, apply, tx } from '@twind/core';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { Portal } from '../Editor/helpers';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { type GalleryImage } from '@akashaorg/typings/lib/ui';

export interface IImageOverlay {
  clickedImg: GalleryImage;
  images: GalleryImage[];
  closeModal: () => void;
}

const closeDivClass = apply(
  'flex items-center justify-center z-1 w-12 h-12 rounded-full bg(grey9 dark:grey3)',
);

/**
 * Component that renders the full screen image modal that is triggered on image click
 * @param images - list of images
 * @param clickedImg -  image that was clicked to open the overlay
 */
const ImageOverlay: React.FC<IImageOverlay> = props => {
  const { clickedImg, images, closeModal } = props;

  const [currentImg, setCurrentImg] = React.useState(clickedImg);

  const transformRef = React.useRef(null);

  const handleZoomIn = () => {
    if (transformRef) {
      transformRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    transformRef.current.zoomOut();
  };

  const handlePrevImg = React.useCallback(() => {
    const currImgIndex = images.findIndex(image => image.src === currentImg.src);
    const prevIndex = currImgIndex > 0 ? images[currImgIndex - 1] : images[images.length - 1];
    setCurrentImg(prevIndex);
  }, [currentImg, images]);

  const handleNextImg = React.useCallback(() => {
    const currImgIndex = images.findIndex(image => image.src === currentImg.src);
    const nextIndex = currImgIndex < images.length - 1 ? images[currImgIndex + 1] : images[0];
    setCurrentImg(nextIndex);
  }, [currentImg, images]);

  const [imgLoaded, setImgLoaded] = React.useState(false);

  const handleImageOnLoad = () => {
    transformRef.current?.resetTransform();
    setImgLoaded(true);
  };

  React.useEffect(() => {
    const handler = ev => {
      if (ev.key === 'Escape') {
        closeModal();
      }
      if (ev.key === 'ArrowRight') {
        handleNextImg();
      }
      if (ev.key === 'ArrowLeft') {
        handlePrevImg();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images, currentImg, closeModal, handleNextImg, handlePrevImg]);

  return (
    <Portal>
      <Stack customStyle="fixed top-0 w-screen h-screen bg-black/80 z-[105]">
        <Stack direction="row" customStyle="justify-end sm:justify-between p-4 sm:p-12">
          <Stack direction="row" spacing="gap-3">
            {images.length > 1 && (
              <button className={tx(`${closeDivClass}`)} onClick={handlePrevImg}>
                <Icon icon={<ArrowLeftIcon />} accentColor />
              </button>
            )}
            {images.length > 1 && (
              <button className={tx(`${closeDivClass}`)} onClick={handleNextImg}>
                <Icon icon={<ArrowRightIcon />} accentColor />
              </button>
            )}
          </Stack>

          <Stack direction="row" spacing="gap-3">
            <button className={tx(`${closeDivClass}`)} onClick={handleZoomIn}>
              <Icon icon={<MagnifyingGlassPlusIcon />} accentColor />
            </button>
            <button className={tx(`${closeDivClass}`)} onClick={handleZoomOut}>
              <Icon icon={<MagnifyingGlassMinusIcon />} accentColor />
            </button>
            <button className={tx(`${closeDivClass}`)} onClick={closeModal}>
              <Icon icon={<XMarkIcon />} accentColor />
            </button>
          </Stack>
        </Stack>
        {currentImg && (
          <Stack customStyle="h-full" align="center" justify="center">
            <TransformWrapper
              key={currentImg.src}
              ref={transformRef}
              centerOnInit={true}
              centerZoomedOut={false}
              limitToBounds={true}
              disablePadding={true}
              panning={{ disabled: true }}
              alignmentAnimation={{ animationTime: 0 }}
            >
              <TransformComponent wrapperStyle={{ height: '100%', width: '100%' }}>
                <img
                  className={tw(
                    `block max-w-full max-h-full ${imgLoaded ? 'opacity-100' : 'opacity-0'}`,
                  )}
                  loading="lazy"
                  decoding="async"
                  src={currentImg.src}
                  alt={currentImg.src}
                  onLoad={handleImageOnLoad}
                />
              </TransformComponent>
            </TransformWrapper>
          </Stack>
        )}
      </Stack>
    </Portal>
  );
};

export default ImageOverlay;
