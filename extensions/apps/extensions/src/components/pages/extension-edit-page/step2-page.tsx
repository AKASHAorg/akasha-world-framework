import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ExtensionEditStep2Form, {
  ExtensionEditStep2FormValues,
} from '@akashaorg/design-system-components/lib/components/ExtensionEditStep2Form';
import { useAkashaStore, transformSource, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { NotificationEvents, NotificationTypes, Extension } from '@akashaorg/typings/lib/ui';
import { DRAFT_EXTENSIONS, ExtType, MAX_GALLERY_IMAGES } from '../../../constants';
import { useAtom } from 'jotai';
import { AtomContext, FormData } from './main-page';
import Stepper from '@akashaorg/design-system-core/lib/components/Stepper';

type ExtensionEditStep2PageProps = {
  extensionId: string;
};

export const ExtensionEditStep2Page: React.FC<ExtensionEditStep2PageProps> = ({ extensionId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');
  const { uiEvents } = useRootComponentProps();
  const uiEventsRef = React.useRef(uiEvents);

  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const showErrorNotification = React.useCallback((title: string) => {
    uiEventsRef.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title,
      },
    });
  }, []);

  // fetch the draft extensions that are saved only on local storage
  const draftExtensions: Extension[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [];
    } catch (error) {
      showErrorNotification(error);
    }
  }, [authenticatedDID, showErrorNotification]);

  const extensionData = draftExtensions?.find(draftExtension => draftExtension.id === extensionId);

  const formValue = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(extensionId)) || {};
    } catch (error) {
      showErrorNotification(error);
    }
  }, [extensionId, showErrorNotification]);

  const defaultValues = useMemo(() => {
    return formValue.lastCompletedStep > 1 ? formValue : extensionData;
  }, [extensionData, formValue]);

  const formDefault: FormData = useMemo(() => {
    return {
      nsfw: defaultValues?.nsfw,
      description: defaultValues?.description,
      gallery: defaultValues?.gallery,
      links: defaultValues?.links?.map((link, index) => ({ _id: index + 1, ...link })),
    };
  }, [defaultValues]);

  const [, setForm] = useAtom<FormData>(useContext(AtomContext));

  const galleryImages = useMemo(() => {
    const gallery = Array.isArray(formValue?.gallery) ? formValue.gallery : formDefault?.gallery;
    return gallery?.map(img => {
      let imgWithGateway = null;
      try {
        imgWithGateway = transformSource(img);
      } catch (error) {
        showErrorNotification((error satisfies Error).message ?? error);
      }
      return {
        ...img,
        src: img?.src,
        displaySrc: imgWithGateway?.src,
        size: {
          height: img?.height,
          width: img?.width,
        },
      };
    });
  }, [formDefault?.gallery, formValue.gallery, showErrorNotification]);

  const storeFormData = (data: ExtensionEditStep2FormValues) => {
    const step2Data = {
      ...data,
      gallery: galleryImages?.map(galleryImage => {
        return {
          width: galleryImage.size?.width,
          height: galleryImage.size?.height,
          src: galleryImage.src,
        };
      }),
    };
    setForm(prev => {
      return {
        ...prev,
        ...step2Data,
        lastCompletedStep:
          !formValue.lastCompletedStep || formValue.lastCompletedStep < 2
            ? 2
            : formValue.lastCompletedStep,
      };
    });
  };

  return (
    <>
      <Stack padding={16} justify="center" align="center">
        <Stepper length={3} currentStep={formValue.lastCompletedStep + 1} />
      </Stack>
      <Stack spacing="gap-y-4">
        <Stack padding={16}>
          <Text variant="h5" weight="semibold" align="center">
            {t('Present your Extension')}
          </Text>
        </Stack>
        <ExtensionEditStep2Form
          nsfwFieldLabel={t('Extension NSFW?')}
          nsfwDescriptionLabel={t('Once you mark it as NSFW, you can’t change it back')}
          descriptionFieldLabel={t('Description')}
          descriptionPlaceholderLabel={t('What does this extension do?')}
          galleryFieldLabel={t('Gallery')}
          galleryDescriptionLabel={t(
            'The first three images, based on your order, will be featured on the main extension card.',
          )}
          usefulLinksFieldLabel={t('Useful Links')}
          usefulLinksDescriptionLabel={t(
            'Include any relevant links, such as documentation or contact information, that you believe will be helpful to others.',
          )}
          linkTitleLabel={t('Link')}
          linkPlaceholderLabel={t('Link title')}
          addLabel={t('Add')}
          updateGalleryLabel={t('Update gallery')}
          imagesUploadedLabel={t('images uploaded')}
          images={galleryImages}
          defaultValues={formDefault}
          maxGalleryImages={MAX_GALLERY_IMAGES}
          handleManageGalleryClick={formData => {
            storeFormData(formData);
            navigate({
              to: '/edit-extension/$extensionId/gallery-manager',
              search: { type: ExtType.LOCAL },
              params: {
                extensionId,
              },
            });
          }}
          cancelButton={{
            label: t('Back'),
            disabled: false,
            handleClick: () => {
              navigate({
                to: '/edit-extension/$extensionId/step1',
              });
            },
          }}
          nextButton={{
            label: t('Next'),
            handleClick: data => {
              storeFormData(data);
              navigate({
                to: '/edit-extension/$extensionId/step3',
              });
            },
          }}
        />
      </Stack>
    </>
  );
};
