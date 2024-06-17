import React from 'react';
import Link from '../Link';
import Stack from '../Stack';
import AvatarImage from './avatar-image';
import {
  generateActiveOverlayClass,
  generateAvatarContainerStyle,
  getImageFromSeed,
} from '../../utils';
import { type Image } from '@akashaorg/typings/lib/ui';
import Card from '../Card';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type AvatarBorderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type AvatarBorderColor = 'white' | 'darkerBlue' | 'accent';

type AvatarContentProps = {
  dataTestId?: string;
  alt?: string;
  avatar?: Image;
  alternativeAvatars?: Image[];
  active?: boolean;
  border?: AvatarBorderSize;
  size?: AvatarSize;
  borderColor?: AvatarBorderColor;
  backgroundColor?: string;
  faded?: boolean;
  isClickable?: boolean;
  profileId?: string | null;
  publicImgPath?: string;
  customStyle?: string;
  onClick?: React.MouseEventHandler;
};

export type AvatarProps = AvatarContentProps & {
  href?: string;
};

const AvatarContent: React.FC<AvatarContentProps> = props => {
  const {
    alt,
    avatar,
    active,
    border,
    size = 'md',
    borderColor,
    backgroundColor,
    faded,
    isClickable = false,
    profileId = '0x0000000000000000000000000000000',
    publicImgPath = '/images',
    customStyle = '',
    dataTestId,
    onClick,
  } = props;

  const seed = getImageFromSeed(profileId, 7);
  const avatarFallback = `${publicImgPath}/avatar-${seed}-min.webp`;

  const containerStyle = generateAvatarContainerStyle({
    size,
    border,
    borderColor,
    customStyle,
    isClickable,
    backgroundColor,
  });

  const activeOverlayClass = generateActiveOverlayClass();

  return (
    <Card dataTestId={dataTestId} type="plain" onClick={onClick}>
      <Stack customStyle={containerStyle}>
        {(avatar || avatarFallback) && (
          <React.Suspense fallback={<></>}>
            <AvatarImage url={avatar?.src} alt={alt} fallbackUrl={avatarFallback} faded={faded} />
          </React.Suspense>
        )}
        {active && <Stack customStyle={activeOverlayClass} />}
      </Stack>
    </Card>
  );
};

const Avatar: React.FC<AvatarProps> = props => {
  const { dataTestId, href, onClick, ...rest } = props;

  if (href) {
    return (
      <Link
        dataTestId={dataTestId}
        to={href}
        // tabIndex is set to -1 to allow keyboard focus while preventing direct navigation using Tab key
        tabIndex={-1}
        onClick={onClick}
      >
        <AvatarContent {...rest} />
      </Link>
    );
  }

  return <AvatarContent dataTestId={dataTestId} onClick={onClick} {...rest} />;
};

export default Avatar;
