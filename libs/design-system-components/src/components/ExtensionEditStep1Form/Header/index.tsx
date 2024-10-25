import React, { useState, useEffect } from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppCoverImage from '@akashaorg/design-system-core/lib/components/AppCoverImage';
import List, { ListProps } from '@akashaorg/design-system-core/lib/components/List';
import EditImageModal from '../../EditImageModal';
import {
  ArrowUpOnSquareIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { CropperProps } from 'react-easy-crop';
import { ExtensionImageType, type Image } from '@akashaorg/typings/lib/ui';
import { ModalProps } from '@akashaorg/design-system-core/lib/components/Modal';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils/getColorClasses';
import { useCloseActions } from '@akashaorg/design-system-core/lib/utils/useCloseActions';
import { DeleteImageModal } from './DeleteImageModal';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
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
  isSavingImage: boolean;
  publicImagePath: string;
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
  isSavingImage,
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
  const [uploadedLogoImageUrl, setUploadedLogoImageUrl] = useState(logoImage);
  const [uploadedCoverImageUrl, setUploadedCoverImageUrl] = useState(coverImage);

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

  const imageModalProps: Partial<CropperProps> =
    appImageType === 'logo-image'
      ? { aspect: 250 / 250, cropShape: 'rect' }
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
          setUploadedLogoImageUrl({ src: URL.createObjectURL(image), width: 0, height: 0 });
          break;
        case 'cover-image':
          onCoverImageChange(image);
          setUploadedCoverImageUrl({ src: URL.createObjectURL(image), width: 0, height: 0 });
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
          align="center"
          justify="center"
          customStyle="absolute left-6 -bottom-8"
          ref={editLogoImageRef}
        >
          <AppAvatar
            appType={extensionType}
            avatar={logoImageUrl}
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
      </Stack>
      <EditImageModal
        show={showEditImage}
        title={appImageType === 'logo-image' ? imageTitle.logoImage : imageTitle.coverImage}
        cancelLabel={cancelLabel}
        saveLabel={saveLabel}
        onClose={() => {
          if (isSavingImage) return;
          setShowEditImage(false);
        }}
        images={
          appImageType === 'logo-image'
            ? [uploadedLogoImageUrl?.src || logoImage?.src]
            : [uploadedCoverImageUrl?.src || coverImage?.src]
        }
        dragToRepositionLabel={dragToRepositionLabel}
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
      <input ref={uploadInputRef} type="file" onChange={e => onUpload(e.target.files[0])} hidden />
    </Stack>
  );
};
