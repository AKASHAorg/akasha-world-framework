import React, { useState, useEffect } from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppCoverImage from '@akashaorg/design-system-core/lib/components/AppCoverImage';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import List, { ListProps } from '@akashaorg/design-system-core/lib/components/List';
import ImageModal, { ImageModalProps } from '../../ImageModal';
import Img from '@akashaorg/design-system-core/lib/components/Image';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import {
  ArrowUpOnSquareIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { ExtensionImageType, type Image } from '@akashaorg/typings/lib/ui';
import Modal, { ModalProps } from '@akashaorg/design-system-core/lib/components/Modal';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils';
import { useCloseActions } from '@akashaorg/design-system-core/lib/utils/useCloseActions';
import { DeleteImageModal } from './DeleteImageModal';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

export type HeaderProps = {
  extensionType?: AkashaAppApplicationType;
  coverImage: Image;
  logoImage: Image;
  cancelLabel: string;
  deleteLabel: string;
  saveLabel: string;
  imageTitle: { logoImage: ModalProps['title']; coverImage: ModalProps['title'] };
  deleteTitle: { logoImage: ModalProps['title']; coverImage: ModalProps['title'] };
  confirmationLabel: { logoImage: string; coverImage: string };
  dragToRepositionLabel: string;
  cropErrorLabel: string;
  isSavingImage: boolean;
  publicImagePath: string;
  logoGuidelines: {
    guidelines: string[];
    titleLabel: string;
    imageDescription: string;
  };
  logoPreviewTitle: string;
  onLogoImageChange: (logoImage?: File) => void;
  onCoverImageChange: (coverImage?: File) => void;
  onImageSave: (type: ExtensionImageType, image?: File) => void;
  onImageDelete: (type: ExtensionImageType) => void;
};

export const Header: React.FC<HeaderProps> = ({
  extensionType,
  coverImage,
  logoImage,
  cancelLabel,
  deleteLabel,
  saveLabel,
  imageTitle,
  deleteTitle,
  confirmationLabel,
  dragToRepositionLabel,
  cropErrorLabel,
  isSavingImage,
  publicImagePath,
  logoGuidelines,
  logoPreviewTitle,
  onLogoImageChange,
  onCoverImageChange,
  onImageSave,
  onImageDelete,
}) => {
  const uploadInputRef: React.RefObject<HTMLInputElement> = React.useRef(null);
  const [showLogoImageActions, setShowLogoImageActions] = useState(false);
  const [showCoverActions, setShowCoverDropdown] = useState(false);
  const [appImageType, setAppImageType] = useState<ExtensionImageType>();
  const [showEditImage, setShowEditImage] = useState(false);
  const [showDeleteImage, setShowDeleteImage] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState(logoImage);
  const [coverImageUrl, setCoverImageUrl] = useState(coverImage);
  const [showLogoGuidelineModal, setShowLogoGuidelineModal] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!isSavingImage) {
      setShowEditImage(false);
    }
  }, [isSavingImage]);

  const editLogoImageRef = useCloseActions(() => {
    setShowLogoImageActions(false);
  });

  const editCoverRef = useCloseActions(() => {
    setShowCoverDropdown(false);
  });

  const closeActionsDropDown = () => {
    switch (appImageType) {
      case 'logo-image':
        setShowLogoImageActions(false);
        return;
      case 'cover-image':
        setShowCoverDropdown(false);
        return;
    }
  };

  const showEditAndDeleteMenuOptions =
    (appImageType === 'logo-image' && !!logoImageUrl?.src) ||
    (appImageType === 'cover-image' && !!coverImageUrl?.src);

  const dropDownActions: ListProps['items'] = [
    {
      label: 'Upload',
      icon: <ArrowUpOnSquareIcon />,
      onClick: () => {
        if (uploadInputRef.current) uploadInputRef.current.click();
        closeActionsDropDown();
      },
    },
    ...(showEditAndDeleteMenuOptions
      ? [
          {
            label: 'Edit',
            icon: <PencilIcon />,
            onClick: () => {
              switch (appImageType) {
                case 'logo-image':
                  setImages([logoImageUrl]);
                  break;
                case 'cover-image':
                  setImages([coverImageUrl]);
              }
              setShowEditImage(true);
              closeActionsDropDown();
            },
          },
          {
            label: 'Delete',
            icon: <TrashIcon />,
            color: { light: 'errorLight', dark: 'errorDark' } as const,
            onClick: () => {
              setShowDeleteImage(true);
              closeActionsDropDown();
            },
          },
        ]
      : []),
  ];

  const imageModalProps: Partial<ImageModalProps> =
    appImageType === 'logo-image'
      ? {
          previewTitle: logoPreviewTitle,
          previews: [
            { dimension: 110 },
            { dimension: 60 },
            { dimension: 40, circular: true },
            { dimension: 32, circular: true },
            { dimension: 16, circular: true },
          ],
          width: 312,
          height: 224,
          aspect: 1 / 1,
          cropShape: 'rect',
        }
      : { aspect: 560 / 169, objectFit: 'contain' };

  const onSave = (image: File) => {
    if (image) {
      switch (appImageType) {
        case 'logo-image':
          onImageSave('logo-image', image);
          onLogoImageChange(image);
          setLogoImageUrl({ src: URL.createObjectURL(image), width: 0, height: 0 });
          break;
        case 'cover-image':
          onImageSave('cover-image', image);
          onCoverImageChange(image);
          setCoverImageUrl({ src: URL.createObjectURL(image), width: 0, height: 0 });
      }
    }
  };

  const onDelete = () => {
    switch (appImageType) {
      case 'logo-image':
        onImageDelete('logo-image');
        onLogoImageChange(null);
        setLogoImageUrl(null);
        break;
      case 'cover-image':
        onImageDelete('cover-image');
        onCoverImageChange(null);
        setCoverImageUrl(null);
    }
    setShowDeleteImage(false);
  };

  const onUpload = (image: File) => {
    if (image) {
      switch (appImageType) {
        case 'logo-image':
          onLogoImageChange(image);
          setImages([{ src: URL.createObjectURL(image), width: 0, height: 0 }]);
          break;
        case 'cover-image':
          onCoverImageChange(image);
          setImages([{ src: URL.createObjectURL(image), width: 0, height: 0 }]);
      }
      setShowEditImage(true);
    }
    uploadInputRef.current.value = '';
  };

  return (
    <Stack direction="column" spacing="gap-y-2">
      <Stack customStyle="relative mb-8">
        <Stack
          fullWidth
          background={{ light: 'grey7', dark: 'grey5' }}
          customStyle={`h-28 rounded-2xl`}
        >
          <AppCoverImage
            src={coverImageUrl?.src}
            appType={extensionType}
            customStyle={'h-28 rounded-2xl'}
          />
          <Stack
            ref={editCoverRef}
            direction="column"
            spacing="gap-y-1"
            customStyle="absolute bottom-4 right-4"
          >
            <Button
              icon={<PencilSquareIcon />}
              size="xs"
              variant="primary"
              onClick={() => {
                setShowCoverDropdown(!showCoverActions);
                setAppImageType('cover-image');
              }}
              greyBg
              iconOnly
            />
            {showCoverActions && (
              <List items={dropDownActions} customStyle="absolute right-0 top-7 w-auto z-10" />
            )}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          align="end"
          spacing="gap-x-2"
          customStyle="absolute left-6 -bottom-8"
        >
          <Stack align="center" justify="center" ref={editLogoImageRef}>
            <AppAvatar
              appType={extensionType}
              avatar={logoImageUrl}
              onClick={() => {
                setShowLogoImageActions(!showLogoImageActions);
                setAppImageType('logo-image');
              }}
              customStyle={`border-2 ${getColorClasses(
                {
                  light: 'white',
                  dark: 'grey2',
                },
                'border',
              )} ${getColorClasses(
                {
                  light: 'grey8',
                  dark: 'grey4',
                },
                'bg',
              )}`}
            />
            <Stack customStyle="absolute">
              <Button
                icon={<PencilSquareIcon />}
                size="xs"
                variant="primary"
                onClick={() => {
                  setShowLogoImageActions(!showLogoImageActions);
                  setAppImageType('logo-image');
                }}
                greyBg
                iconOnly
              />
              {showLogoImageActions && (
                <List items={dropDownActions} customStyle="absolute top-7 w-auto z-10" />
              )}
            </Stack>
          </Stack>
          <Button
            icon={<InformationCircleIcon />}
            iconDirection="left"
            variant="text"
            label={logoGuidelines.titleLabel}
            onClick={() => setShowLogoGuidelineModal(true)}
          />
        </Stack>
      </Stack>
      <ImageModal
        show={showEditImage}
        title={appImageType === 'logo-image' ? imageTitle.logoImage : imageTitle.coverImage}
        cancelLabel={cancelLabel}
        saveLabel={saveLabel}
        onClose={() => {
          if (isSavingImage) return;
          setShowEditImage(false);
        }}
        images={images}
        rightAlignActions={true}
        dragToRepositionLabel={dragToRepositionLabel}
        errorLabel={cropErrorLabel}
        isSavingImage={isSavingImage}
        onSave={onSave}
        {...imageModalProps}
      />
      <DeleteImageModal
        show={showDeleteImage}
        title={appImageType === 'logo-image' ? deleteTitle.logoImage : deleteTitle.coverImage}
        cancelLabel={cancelLabel}
        deleteLabel={deleteLabel}
        confirmationLabel={
          appImageType === 'logo-image' ? confirmationLabel.logoImage : confirmationLabel.coverImage
        }
        onDelete={onDelete}
        onClose={() => setShowDeleteImage(false)}
      />
      <Modal
        show={showLogoGuidelineModal}
        title={{ label: logoGuidelines.titleLabel, variant: 'h6' }}
        onClose={() => setShowLogoGuidelineModal(false)}
      >
        <Stack align="center" spacing="gap-y-4" padding="p-4">
          <ul className="list-disc ml-2 text(black dark:white)">
            {logoGuidelines.guidelines.map((guideline, index) => (
              <li key={index}>
                <Text variant="body1">{guideline}</Text>
              </li>
            ))}
          </ul>
          <Stack align="center" spacing="gap-y-4" customStyle="relative">
            <Img
              src={`${publicImagePath}/extension-logo-guidelines.webp`}
              alt="extensions-logo-guideline"
              customStyle={`w-[12.5rem]`}
            />
            <Text
              variant="footnotes2"
              color={{ light: 'grey4', dark: 'grey6' }}
              customStyle="absolute bottom-0"
            >
              {logoGuidelines.imageDescription}
            </Text>
          </Stack>
        </Stack>
      </Modal>
      <input ref={uploadInputRef} type="file" onChange={e => onUpload(e.target.files[0])} hidden />
    </Stack>
  );
};
