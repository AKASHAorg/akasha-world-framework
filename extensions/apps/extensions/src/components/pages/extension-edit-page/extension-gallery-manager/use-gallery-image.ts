import { Image } from '@akashaorg/design-system-components/lib/components/ExtensionGalleryManager';
import { type Extension, NotificationEvents, NotificationTypes } from '@akashaorg/typings/lib/ui';
import { transformSource, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectDraftExtensions } from '../../../../utils/selectors/get-draft-extensions';
import { selectFormValues } from '../../../../utils/selectors/get-form-values';

interface IUseGalleryImages {
  extensionId: string;
}

export const useGalleryImages = ({ extensionId }: IUseGalleryImages) => {
  const { t } = useTranslation('app-extensions');
  const { uiEvents } = useRootComponentProps();
  const [images, setImages] = useState<(Image & { blob?: File })[]>(null);
  const [extensionData, setExtensionData] = useState<Extension>(null);

  const {
    data: { authenticatedDID, isAuthenticating },
  } = useAkashaStore();

  const uiEventsRef = useRef(uiEvents);

  const showErrorNotification = useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  const setGalleryImages = (images: Image[]) => {
    setImages(images);
  };

  useEffect(() => {
    const { data: draftExtensions, error } = selectDraftExtensions(authenticatedDID);
    if (draftExtensions) {
      setExtensionData(draftExtensions?.find(draftExtension => draftExtension.id === extensionId));
    }

    if (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, extensionId, showErrorNotification]);

  useEffect(() => {
    if (isAuthenticating) return;
    const { data: formValues, error } = selectFormValues(extensionId);

    if (error) {
      showErrorNotification(error);
      return;
    }

    const gallery = formValues?.gallery?.length ? formValues?.gallery : extensionData?.gallery;
    setImages(
      gallery?.map(img => {
        const imgWithGateway = transformSource(img);
        return {
          id: crypto.randomUUID(),
          name: t('extension gallery image'),
          src: imgWithGateway.src || img?.src,
          height: img.height,
          width: img.width,
        };
      }) ?? [],
    );
  }, [
    isAuthenticating,
    extensionData?.gallery,
    authenticatedDID,
    extensionId,
    t,
    showErrorNotification,
  ]);

  return { galleryImages: images, setGalleryImages };
};
