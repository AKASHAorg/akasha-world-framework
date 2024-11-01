import { GalleryImageState } from './gallery-image';

interface IGetGalleryState {
  imageId: string;
  uploading: boolean;
  imageIdsWithError: string[];
}

export function getGalleryState({ imageId, uploading, imageIdsWithError }: IGetGalleryState) {
  if (uploading) return GalleryImageState.LOADING;
  if (imageIdsWithError.includes(imageId)) return GalleryImageState.ERROR;
  return null;
}
