import React from 'react';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import {
  TrashIcon,
  XCircleIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export enum GalleryImageState {
  ERROR = 'error',
  LOADING = 'Loading',
}

export type GalleryImageProps = {
  name: string;
  src: string;
  uploadingLabel: string;
  uploadingErrorLabel: string;
  state?: GalleryImageState;
  handleClickImage?: () => void;
  onDelete: () => void;
};

export const GalleryImage: React.FC<GalleryImageProps> = props => {
  const { name, src, state, uploadingLabel, uploadingErrorLabel, handleClickImage, onDelete } =
    props;
  return (
    <Stack customStyle="relative w-[9.125rem] h-[9.125rem] min-[400px]:w-[10.625rem] min-[400px]:h-[10.625rem] overflow-hidden rounded-lg cursor-pointer">
      <Image
        alt={name}
        src={src}
        onClick={handleClickImage}
        customStyle={`object-cover w-full h-full ${state === GalleryImageState.ERROR || state === GalleryImageState.LOADING ? 'opacity-20' : ''}`}
        showLoadingIndicator
      />
      {
        //action buttons
      }
      <Stack direction="row" spacing="gap-x-2" customStyle="absolute top-2 right-2">
        <Button
          onClick={onDelete}
          disabled={state === GalleryImageState.LOADING}
          customStyle={state === GalleryImageState.LOADING ? 'cursor-not-allowed' : ''}
          plain
        >
          <AppIcon
            placeholderIcon={<TrashIcon />}
            background={'black/50'}
            iconColor="white"
            size="xs"
            iconSize="sm"
            hover
          />
        </Button>
      </Stack>
      {state && (
        <Stack
          align="center"
          justify="center"
          spacing="gap-y-2"
          customStyle="absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2"
          fullWidth
        >
          {state === GalleryImageState.ERROR && (
            <Icon icon={<XCircleIcon />} color="error" size="lg" />
          )}
          {state === GalleryImageState.LOADING && <Spinner />}
          {state === GalleryImageState.ERROR && (
            <Text variant="button-sm" align="center">
              {uploadingErrorLabel}
            </Text>
          )}
          {state === GalleryImageState.LOADING && (
            <Text variant="button-sm" align="center">
              {uploadingLabel}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
};
