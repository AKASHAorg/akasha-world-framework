import React, { ReactElement } from 'react';
import Avatar from '../Avatar';
import DidField from '../DidField';
import Link from '../Link';
import ProfileNameField from '../ProfileNameField';
import Stack from '../Stack';
import { type Image } from '@akashaorg/typings/lib/ui';

type Variant = '1' | '2' | '3' | '4';

export type ProfileAvatarButtonProps = {
  avatar?: Image;
  alternativeAvatars?: Image[];
  label?: string;
  nsfwLabel?: string;
  nsfwAvatar?: boolean;
  profileId: string;
  truncateText?: boolean;
  href?: string;
  metadata?: ReactElement;
  variant?: Variant;
  customStyle?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

/**
 * The ProfileAvatarButton component serves a specific use case: display the profile avatar
 * together with the profile name and DID address in a compact, informative yet flexible way.
 * The full DID address will be truncated to save space when appropriate.
 * @param avatar - (optional) object containing info about the image to be displayed, such as `src`, `height`, and `width`.
 * @param alternativeAvatars - (optional) a list of alternative images for the avatar
 * @param label - (optional) it is usually the profile name
 * @param nsfwLabel - (optional) adds label for NSFW profiles
 * @param nsfwAvatar - (optional) determines when to mask avatar for NSFW profiles
 * @param profileId - the profile DID address
 * @param truncateText - boolean (optional) whether to truncate the label (profile name) when it's too long
 * @param href - (optional) provide href link here
 * @param metadata - string (optional) provide metadata here
 * @param variant - (optional) profile avatar button variant, the default is '2'
 * @param customStyle -  (optional) apply your custom styling (Make sure to use standard Tailwind classes)
 * @param onClick - handler that will be called when clicking on the avatar
 * @example
 * ```tsx
 * const profileId = 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493';
 * const avatar = { src: 'https://placebeard.it/360x360', height: 360, width: 360 };
 *    <ProfileAvatarButton label='Profile Avatar Button' profileId avatar />
 * ```
 **/
const ProfileAvatarButton = React.forwardRef(
  (props: ProfileAvatarButtonProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      customStyle = '',
      avatar,
      label,
      nsfwLabel = '',
      nsfwAvatar = false,
      profileId,
      truncateText = true,
      href,
      metadata,
      variant = '2',
      onClick,
    } = props;

    return (
      <Link to={href} onClick={onClick} customStyle="group block">
        <Stack direction="row" align="center" spacing="gap-x-2" customStyle={customStyle}>
          <Avatar
            dataTestId="avatar-box"
            aria-label="avatar-box"
            size={VARIANTS_MAP[variant].avatar}
            avatar={avatar}
            profileId={profileId}
            isNSFW={nsfwAvatar}
            customStyle="shrink-0 cursor-pointer"
          />
          <Stack
            justify="center"
            spacing="gap-y-0"
            customStyle="align-top"
            dataTestId="info-box"
            aria-label="info-box"
          >
            <Stack direction="row" align="center" spacing="gap-x-1" ref={ref}>
              <ProfileNameField
                did={profileId}
                profileName={label}
                nsfwLabel={nsfwLabel}
                truncateText={truncateText}
                size={VARIANTS_MAP[variant].profileName}
                hover={true}
              />
              {metadata}
            </Stack>
            <DidField did={profileId} isValid={true} copiable={false} />
          </Stack>
        </Stack>
      </Link>
    );
  },
);

type Size = 'sm' | 'md' | 'lg';

const VARIANTS_MAP: Record<Variant, { profileName: Size; avatar: Size }> = {
  '1': {
    profileName: 'sm',
    avatar: 'sm',
  },
  '2': {
    profileName: 'sm',
    avatar: 'md',
  },
  '3': {
    profileName: 'md',
    avatar: 'md',
  },
  '4': {
    profileName: 'lg',
    avatar: 'lg',
  },
};

export default ProfileAvatarButton;
