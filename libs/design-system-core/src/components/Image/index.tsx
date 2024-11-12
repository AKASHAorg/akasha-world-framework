import React, { PropsWithChildren, useState } from 'react';
import Spinner from '../Spinner';
import Stack from '../Stack';
import { apply, tw } from '@twind/core';
import { DelayLoad } from '../../utils/delay-load';

export type ImageProps = PropsWithChildren<
  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    customStyle?: string;
    dataTestId?: string;
    showLoadingIndicator?: boolean;
  }
>;

/**
 * The Image component offers a simple yet efficient way to include an image in your app.
 * The component makes use of lazy loading and async decoding so that the browser will
 * only load your image when needed and decode it asyncronously so as to avoid blocking
 * other elements from rendering.
 * The Image component accepts all the props a normal HTML \<img\> tag accepts, plus more:
 * @param customStyle - (optional) apply your custom styling (Make sure to use standard Tailwind classes)
 * @param dataTestId - (optional) useful when writing tests for the component
 * @param showLoadingIndicator - (optional) show loading indictor while image loads
 * @example
 * ```tsx
 *   <Image customStyle="object-contain rounded-2xl" src={`${publicImgPath}/${imageName}`} />
 * ```
 **/
const Image: React.FC<ImageProps> = props => {
  const { src, customStyle = '', dataTestId, showLoadingIndicator, onLoad, ...rest } = props;
  const [imageLoaded, setImageLoaded] = useState(false);
  const className = apply`object-contain ${customStyle} ${showLoadingIndicator && !imageLoaded ? '!w-0 !h-0' : ''}`;

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (showLoadingIndicator) setImageLoaded(true);
    if (onLoad) onLoad(event);
  };

  return (
    <>
      {showLoadingIndicator && !imageLoaded && (
        <DelayLoad>
          <Stack align="center" justify="center" customStyle={customStyle}>
            <Spinner />
          </Stack>
        </DelayLoad>
      )}
      <img
        loading="lazy"
        decoding="async"
        alt={src}
        src={src}
        className={tw(className)}
        aria-label={src}
        data-testid={dataTestId}
        onLoad={handleImageLoad}
        {...rest}
      />
    </>
  );
};

export default Image;
