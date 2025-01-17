import React, { useMemo } from 'react';
import Stack from '../Stack';
import Icon from '../Icon';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { EyeSlashIcon } from '../Icon/hero-icons-outline';

export type AppCoverImageProps = {
  src?: string;
  appType?: string;
  isNSFW?: boolean;
  publicImgPath?: string;
  customStyle?: string;
};

const AppCoverImage = (props: AppCoverImageProps) => {
  const {
    src,
    isNSFW,
    publicImgPath = '/images',
    appType = AkashaAppApplicationType.App,
    customStyle,
  } = props;

  const coverByType = useMemo(() => {
    switch (appType) {
      case AkashaAppApplicationType.App:
        return {
          desktop: 'extension-cover-desktop-1',
          mobile: 'extension-cover-mobile-1',
        };
      case AkashaAppApplicationType.Widget:
        return {
          desktop: 'extension-cover-desktop-2',
          mobile: 'extension-cover-mobile-2',
        };
      case AkashaAppApplicationType.Plugin:
        return {
          desktop: 'extension-cover-desktop-3',
          mobile: 'extension-cover-mobile-3',
        };
      default:
        return {
          desktop: 'extension-cover-desktop-3',
          mobile: 'extension-cover-mobile-3',
        };
    }
  }, [appType]);

  if (isNSFW) {
    return (
      <Stack
        align="center"
        justify="center"
        background={{ light: 'grey9', dark: 'grey5' }}
        customStyle={customStyle}
        fullWidth
      >
        {isNSFW && (
          <Icon icon={<EyeSlashIcon />} color={{ light: 'errorLight', dark: 'errorDark' }} />
        )}
      </Stack>
    );
  }

  return (
    <picture className={`w-full overflow-hidden ${customStyle}`}>
      {src && <source srcSet={src} />}
      {!src && (
        <>
          {/*desktop version*/}
          <source
            srcSet={`${publicImgPath}/${coverByType.desktop}.webp`}
            type="image/webp"
            media="(min-width: 768px) and (max-width: 1279px), (min-width: 1441px)"
          />
          {/*mobile version*/}
          <source
            srcSet={`${publicImgPath}/${coverByType.mobile}.webp`}
            type="image/webp"
            media="(max-width: 767px), (min-width: 1280px) and (max-width: 1440px)"
          />
        </>
      )}
      <img
        className={`w-full ${customStyle}`}
        src={src || `${publicImgPath}/${coverByType.desktop}.webp`}
        alt="App Cover"
      />
    </picture>
  );
};

export default AppCoverImage;
