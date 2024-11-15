import getSDK from '@akashaorg/core-sdk';
import { useState } from 'react';
import { useRootComponentProps } from './use-root-props';
import type { ExtensionImageType, Image, ProfileImageType } from '@akashaorg/typings/lib/ui';

interface ISaveImage {
  type: ExtensionImageType | ProfileImageType;
  image?: File;
  onError?: (error: Error) => void;
}

/**
 * Hook for uploading avatar or cover image to web3.storage and retrieving their IPFS links
@returns { avatarImage, coverImage, loading, saveImage } - an object containing the avatar and cover image objects (each with src, height, and width fields), a loading flag, and the saveImage function
 * @example useSaveImage hook
 * ```typescript
 * const { avatarImage, coverImage, loading, saveImage } = useSaveImage();
 * ```
 **/
export function useSaveImage() {
  const [loading, setLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState<Image | null>(null);
  const [coverImage, setCoverImage] = useState<Image | null>(null);
  const { logger } = useRootComponentProps();

  const saveImage = async ({ type, image, onError }: ISaveImage) => {
    try {
      if (image) {
        const sdk = getSDK();

        setLoading(true);

        const mediaFile = await sdk.api.profile.saveMediaFile({
          isUrl: false,
          content: image,
          name: type,
        });

        const imageObj = {
          height: mediaFile.size.height,
          width: mediaFile.size.width,
          src: `ipfs://${mediaFile.CID}`,
        };

        switch (type) {
          case 'logo-image':
          case 'avatar':
            setAvatarImage(imageObj);
            break;
          case 'cover-image':
            setCoverImage(imageObj);
            break;
        }

        setLoading(false);
      }
    } catch (error) {
      logger.error(`error while saving image: ${JSON.stringify(error)}`);
      onError(error);
      setLoading(false);
    }
  };

  return { avatarImage, coverImage, loading, saveImage };
}
