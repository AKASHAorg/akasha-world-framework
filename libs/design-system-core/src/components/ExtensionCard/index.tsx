import React, { ReactNode } from 'react';
import Stack from '../Stack';
import Card from '../Card';
import AppCoverImage from '../AppCoverImage';
import Text from '../Text';
import Pill from '../Pill';
import DidField from '../DidField';
import Avatar from '../Avatar';
import ProfileNameField from '../ProfileNameField';
import ExtensionIcon from '../ExtensionIcon';
import { Extension, Image } from '@akashaorg/typings/lib/ui';

export type ExtensionCardProps = {
  coverImageSrc: string;
  displayName: string;
  applicationType: Extension['applicationType'];
  author?: {
    profileDID: string;
    name: string;
    alternativeAvatars: Image[];
    avatar: Image;
    nsfw?: boolean;
  };
  description: string;
  defaultLabel?: string;
  nsfwLabel?: string;
  isDefaultWorldExtension?: boolean;
  nsfw?: boolean;
  featured?: boolean;
  action?: ReactNode;
  customStyle?: string;
};

const ExtensionCard: React.FC<ExtensionCardProps> = props => {
  const {
    coverImageSrc,
    displayName,
    applicationType,
    author,
    description,
    defaultLabel,
    nsfwLabel,
    isDefaultWorldExtension = false,
    nsfw,
    featured,
    action,
    customStyle = '',
  } = props;

  return (
    <Card elevation="1" padding={16} radius={20} customStyle={customStyle}>
      <Stack spacing="gap-y-4">
        <AppCoverImage
          src={coverImageSrc}
          appType={applicationType}
          isNSFW={nsfw}
          customStyle={`${featured ? 'h-[9.625rem]' : 'h-[6.25rem]'} object-cover rounded-[0.625rem]`}
        />
        <Stack spacing="gap-y-3">
          <Stack justify="between" align="center" direction="row" spacing="gap-y-1">
            <Text variant="h6">{displayName}</Text>
            <>{action}</>
          </Stack>
          <Stack direction="row" spacing="gap-x-2">
            <Pill
              color={{ light: 'secondaryLight', dark: 'white' }}
              background={{ light: 'tertiaryLight', dark: 'tertiaryDark' }}
              icon={<ExtensionIcon type={applicationType} size="xs" />}
              weight="normal"
              size="xs"
              label={applicationType}
              type="info"
            />
            {isDefaultWorldExtension && (
              <Pill
                color={{ light: 'white', dark: 'black' }}
                background={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                weight="normal"
                size="xs"
                label={defaultLabel}
                type="info"
              />
            )}
            {nsfw && (
              <Pill
                color={{ light: 'errorLight', dark: 'white' }}
                background={{ light: 'errorFade', dark: 'errorDark' }}
                weight="normal"
                size="xs"
                label={nsfwLabel}
                type="info"
              />
            )}
          </Stack>
          <Stack direction="row" align="center" spacing="gap-x-1">
            <Avatar
              size="xs"
              avatar={author?.avatar}
              alternativeAvatars={author?.alternativeAvatars}
              profileId={author?.profileDID}
              isNSFW={author?.nsfw}
              customStyle="shrink-0 cursor-pointer h-4 w-4"
            />
            <ProfileNameField
              did={author?.profileDID}
              profileName={author?.name}
              color={{ light: 'grey4', dark: 'grey6' }}
              weight="normal"
              truncateText={true}
              size="sm"
              hover={true}
            />
            <DidField did={author?.profileDID} isValid={true} copiable={true} />
          </Stack>
          <Text variant="body2">{description}</Text>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ExtensionCard;
