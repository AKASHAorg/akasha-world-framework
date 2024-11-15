import getSDK from '@akashaorg/core-sdk';
import { useState } from 'react';
import { useRootComponentProps } from './use-root-props';
import { Image } from '@akashaorg/typings/lib/ui';

/**
 * Interface defining the parameters of saveImage function
 * @param name -  name of the image
 * @param image - image blob file
 * @param onError - handler when error occurs while uploading image to web3.storage
 **/
interface ISaveImage {
  name: string;
  image: File;
  onError?: (error: Error) => void;
}

/**
 * Hook for uploading image to web3.storage and retrieving it's IPFS link
@returns { image, loading, saveImage } - an object containing image object (with src, height, and width fields), a loading flag, and the saveImage function to upload image to web3.storage
 * @example useSaveImage hook
 * ```typescript
 * const { image, loading, saveImage } = useSaveImage();
 * ```
 **/
export function useSaveImage() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<Image | null>(null);
  const { logger } = useRootComponentProps();

  const saveImage = async ({ name, image, onError }: ISaveImage) => {
    try {
      if (image) {
        const sdk = getSDK();

        setLoading(true);

        const mediaFile = await sdk.api.profile.saveMediaFile({
          isUrl: false,
          content: image,
          name,
        });

        setImage({
          height: mediaFile.size.height,
          width: mediaFile.size.width,
          src: `ipfs://${mediaFile.CID}`,
        });

        setLoading(false);
      }
    } catch (error) {
      logger.error(`error while saving image: ${JSON.stringify(error)}`);
      onError(error);
      setLoading(false);
    }
  };

  return { image, loading, saveImage };
}
