import React, {
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getMediaUrl, saveMediaFile, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  type BlockInstanceMethods,
  type ContentBlockRootProps,
  NotificationTypes,
  NotificationEvents,
  CreateContentBlock,
} from '@akashaorg/typings/lib/ui';
import {
  useCreateContentBlockMutation,
  useGetAppsByPublisherDidQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import {
  AkashaContentBlockBlockDef,
  type BlockLabeledValue,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import ImageBlockGallery from '@akashaorg/design-system-components/lib/components/ImageBlockGallery';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Image from '@akashaorg/design-system-core/lib/components/Image';
import ImageBlockToolbar from '@akashaorg/design-system-components/lib/components/ImageBlockToolbar';
import ImageModal from '@akashaorg/design-system-components/lib/components/ImageModal';
import { type GalleryImage } from '@akashaorg/typings/lib/ui';
import {
  XMarkIcon,
  ArrowPathIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import getSDK from '@akashaorg/core-sdk';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { selectLatestAppVersionId } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';

const isImgUrl = async url => {
  const response = await fetch(url, { method: 'HEAD' });
  const isImg = response?.headers?.get('Content-Type')?.startsWith('image');
  return isImg;
};

export const ImageEditorBlock = (
  props: ContentBlockRootProps & { blockRef?: React.RefObject<BlockInstanceMethods> },
) => {
  const { t } = useTranslation('app-antenna');
  const sdk = useRef(getSDK());
  //
  const indexingDid = sdk.current.services.common.misc.getIndexingDID();

  const appReq = useGetAppsByPublisherDidQuery({
    variables: {
      id: indexingDid,
      first: 1,
      filters: { where: { name: { equalTo: props.blockInfo.appName } } },
      sorting: { createdAt: SortOrder.Desc },
    },
    context: { source: sdk.current.services.gql.contextSources.default },
  });
  const appVersionID = selectLatestAppVersionId(appReq.data);
  const { uiEvents, logger } = useRootComponentProps();
  const _uiEvents = useRef(uiEvents);
  const [createContentBlock, contentBlockQuery] = useCreateContentBlockMutation();
  const retryCount = useRef<number>();

  const [imageLink, setImageLink] = useState('');
  const [urlNotImage, setURLNotImage] = useState(false);
  const disableURLUpload = !imageLink || urlNotImage;

  const [uiState, setUiState] = useState('menu');

  const [contentBlockImages, setContentBlockImages] = useState<GalleryImage[]>([]);
  const imageGalleryImages = useMemo(
    () =>
      contentBlockImages.map(imageObj => {
        return {
          src: imageObj.displaySrc,
          size: imageObj.size,
          name: imageObj.name,
          originalSrc: imageObj.originalSrc,
        };
      }),
    [contentBlockImages],
  );
  const imageUrls = useMemo(
    () => contentBlockImages.map(imageObj => imageObj.originalSrc),
    [contentBlockImages],
  );
  const [alignState, setAlignState] = useState<'start' | 'center' | 'end'>('start');
  const [showCaption, setShowCaption] = useState(false);
  const [caption, setCaption] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  React.useEffect(() => {
    const disablePublish =
      imageGalleryImages.length === 0 || !!imageGalleryImages.find(image => !image.name);
    if (typeof props.blockInfo.externalHandler === 'function') {
      props.blockInfo.externalHandler(disablePublish);
    }
  }, [imageGalleryImages, props.blockInfo]);

  const createBlock = useCallback(
    async ({ nsfw }: CreateContentBlock) => {
      if (!appVersionID) {
        return {
          response: {
            blockID: null,
            error: t('Extension not found!'),
          },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
        };
      }
      const imageData = {
        images: contentBlockImages.map(imageObj => {
          return {
            src: imageObj?.src,
            size: imageObj?.size,
            name: imageObj?.name,
          };
        }),
        caption,
        align: alignState,
      };
      const content = JSON.stringify(imageData);
      const contentBlockValue: BlockLabeledValue = {
        label: props.blockInfo.appName,
        propertyType: props.blockInfo.propertyType,
        value: content,
      };
      try {
        const resp = await createContentBlock({
          variables: {
            i: {
              content: {
                appVersionID: appVersionID,
                createdAt: new Date().toISOString(),
                content: [contentBlockValue],
                active: true,
                kind: AkashaContentBlockBlockDef.Other,
                nsfw,
              },
            },
          },
          context: { source: sdk.current.services.gql.contextSources.composeDB },
        });
        return {
          response: { blockID: resp.data.createAkashaContentBlock.document.id },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
        };
      } catch (err) {
        logger.error('error creating content block', err);
        return {
          response: {
            blockID: null,
            error: err.message,
          },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
        };
      }
    },
    [
      alignState,
      caption,
      createContentBlock,
      contentBlockImages,
      props.blockInfo,
      logger,
      appVersionID,
      t,
    ],
  );

  const retryCreate = useCallback(
    async (arg: CreateContentBlock) => {
      if (contentBlockQuery.called) {
        contentBlockQuery.reset();
      }
      retryCount.current += 1;
      return createBlock(arg);
    },
    [contentBlockQuery, createBlock],
  );

  useImperativeHandle(
    props.blockRef,
    () => ({
      createBlock,
      retryBlockCreation: retryCreate,
      handleFocusBlock,
    }),
    [createBlock, retryCreate],
  );

  const handleChange = async e => {
    const imageUrl = e.currentTarget.value;
    setImageLink(imageUrl);
    try {
      const isImg = await isImgUrl(imageUrl);
      setURLNotImage(!isImg);
      if (!isImg) {
        const notifMsg = t(`URL doesn't contain an image.`);
        _uiEvents.current.next({
          event: NotificationEvents.ShowNotification,
          data: {
            type: NotificationTypes.Error,
            title: notifMsg,
          },
        });
      }
    } catch (error) {
      setURLNotImage(true);
      const notifMsg = error.message;
      _uiEvents.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Error,
          title: notifMsg,
        },
      });
    }
  };

  const uploadInputRef: RefObject<HTMLInputElement> = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploadDisabled, setImageUploadDisabled] = useState(false);

  const handleMediaClick = () => {
    if (uploadInputRef.current && !imageUploadDisabled) {
      uploadInputRef.current.click();
    }
  };

  const onUpload = async (image: File | string, isUrl?: boolean) => {
    if (!image) return null;
    setUiState('gallery');
    setUploading(true);

    const imageName = typeof image === 'string' ? image : image.name || 'beam-block-image';

    try {
      const mediaFile = await saveMediaFile({
        name: imageName,
        isUrl: isUrl || false,
        content: image,
      });
      setUploading(false);
      if (!mediaFile) return null;

      const mediaUri = `ipfs://${mediaFile.CID}`;

      const mediaUrl = getMediaUrl(mediaUri);

      const imageObj = {
        size: { height: mediaFile.size.height, width: mediaFile.size.width },
        displaySrc: mediaUrl.originLink || mediaUrl.fallbackLink,
        src: mediaUri,
        name: imageName,
        originalSrc: typeof image === 'string' ? image : URL.createObjectURL(image),
      };

      return imageObj;
    } catch (error) {
      setUploading(false);
      const notifMsg = error?.message;
      _uiEvents.current.next({
        event: NotificationEvents.ShowNotification,
        data: {
          type: NotificationTypes.Error,
          title: notifMsg,
        },
      });
      return null;
    }
  };

  const uploadNewImage = async (image: File | string, isUrl?: boolean) => {
    const uploadedImage = await onUpload(image, isUrl);
    setContentBlockImages(prev => [
      ...prev,
      {
        name: uploadedImage?.name,
        src: uploadedImage?.src,
        displaySrc: uploadedImage?.displaySrc,
        originalSrc: uploadedImage?.originalSrc,
        size: uploadedImage?.size,
      },
    ]);
    uploadInputRef.current.value = '';
  };

  const uploadEditedImage = async (image: File, indexOfEditedImage: number) => {
    const uploadedImage = await onUpload(image);
    const oldImage = contentBlockImages[indexOfEditedImage];
    setContentBlockImages(prev => [
      ...prev.slice(0, indexOfEditedImage),
      {
        name: oldImage?.name,
        src: uploadedImage?.src,
        displaySrc: uploadedImage?.displaySrc,
        originalSrc: uploadedImage?.originalSrc,
        size: uploadedImage?.size,
      },
      ...prev.slice(indexOfEditedImage + 1),
    ]);
    setCanCloseModal(true);
  };

  const [canCloseModal, setCanCloseModal] = useState(false);
  useEffect(() => {
    if (!uploading && showEditModal && canCloseModal) {
      setShowEditModal(false);
      setCanCloseModal(false);
    }
  }, [uploading, showEditModal, canCloseModal]);

  const handleCloseModal = () => {
    setCanCloseModal(true);
  };

  const handleDeleteImage = (element: GalleryImage) => {
    const newImages = contentBlockImages.filter(image => image.src !== element.src);

    if (newImages.length < 4) {
      setImageUploadDisabled(false);
    }
    if (newImages.length === 0) {
      setUiState('menu');
    }
    setContentBlockImages(newImages);
    const notifMsg = t('Uploaded image removed.');
    _uiEvents.current.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: notifMsg,
      },
    });
  };

  const handleClickAddImage = () => {
    setUiState('menu');
  };

  const handleClickEdit = () => {
    setShowEditModal(true);
  };

  const handleCaptionClick = () => {
    if (showCaption === true) {
      setCaption('');
    }
    setShowCaption(!showCaption);
  };

  const handleLeftAlignClick = () => {
    setAlignState('start');
  };
  const handleCenterAlignClick = () => {
    setAlignState('center');
  };
  const handleRightAlignClick = () => {
    setAlignState('end');
  };

  const handleCaptionChange = e => {
    setCaption(e.currentTarget.value);
  };

  const handleCloseMenu = () => {
    setUiState('gallery');
  };

  const [isFocusedEditor, setIsFocusedEditor] = useState(false);
  /**
   * this is used to display/hide elements only when a block instance is focused
   * must be exposed to outer components through useImperativeHandle
   * the logic for updating the currently focused block is in beam-editor
   */
  const handleFocusBlock = (focus: boolean) => {
    setIsFocusedEditor(focus);
  };

  const maxImagesLimitReached = contentBlockImages.length === 4;

  return (
    <>
      {uiState === 'menu' && (
        <Card background={{ dark: 'grey3', light: 'grey9' }}>
          <Stack direction="column">
            {imageGalleryImages.length > 0 && (
              <Stack direction="row" justify="end">
                <button onClick={handleCloseMenu}>
                  <Icon icon={<XMarkIcon />} accentColor />
                </button>
              </Stack>
            )}
            <Stack customStyle="pb-8">
              <Button
                label={t('Add an image from device')}
                variant="primary"
                customStyle="w-full sm:w-48"
                onClick={handleMediaClick}
                disabled={imageUploadDisabled || maxImagesLimitReached}
              />
            </Stack>
            <Divider />
            <Stack direction="column" spacing="gap-2" customStyle="py-8">
              <Text variant="h6">{t('From URL')}</Text>
              <Stack direction="row" justify="between">
                <TextField
                  value={imageLink}
                  placeholder={t('Paste image link')}
                  altBg
                  fullWidth
                  type={'text'}
                  onChange={handleChange}
                  disabled={imageUploadDisabled || maxImagesLimitReached}
                  customStyle="w-5/6"
                />
                <Button
                  label={t('Add')}
                  variant="secondary"
                  disabled={disableURLUpload || maxImagesLimitReached}
                  onClick={() => uploadNewImage(imageLink, true)}
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="column" spacing="gap-2" customStyle="overflow-auto pt-8">
              <Stack direction="row" justify="between">
                <Text variant="h6">{t('Uploaded images')} </Text>
                <Text variant="subtitle2">{`${contentBlockImages.length}/4 ${t('images')}`}</Text>
              </Stack>
              {contentBlockImages.map((imageObj, index) => (
                <Stack key={index} direction="row" justify="between">
                  <Stack direction="row" spacing="gap-1">
                    <Image
                      alt={imageObj.name}
                      src={imageObj.originalSrc}
                      customStyle="object-contain w-8 h-8 rounded-lg"
                    />
                    <Text>{imageObj.name}</Text>
                  </Stack>
                  <button onClick={() => handleDeleteImage(imageObj)}>
                    <Icon accentColor icon={<XMarkIcon />} />
                  </button>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}
      {uiState === 'gallery' && uploading && contentBlockImages.length === 0 && (
        <Stack
          customStyle="w-4/5 h-48 sm:h-60 rounded-xl"
          justify="center"
          align="center"
          background={{ light: 'grey8', dark: 'grey5' }}
          spacing="gap-2"
        >
          <Icon icon={<ArrowPathIcon />} rotateAnimation />
          <Text>{t('Uploading image')}</Text>
        </Stack>
      )}
      {uiState === 'gallery' && imageGalleryImages.length > 0 && (
        <Stack spacing="gap-1">
          <Stack alignSelf={alignState}>
            <ImageBlockGallery
              images={imageGalleryImages}
              uploading={uploading && !showEditModal}
            />
          </Stack>
          {showCaption && (
            <TextField
              // eslint-disable-next-line
              autoFocus
              value={caption}
              placeholder={t('Write caption here')}
              type={'text'}
              onChange={handleCaptionChange}
            />
          )}
          {isFocusedEditor && (
            <ImageBlockToolbar
              handleCaptionClick={handleCaptionClick}
              handleLeftAlignClick={handleLeftAlignClick}
              handleCenterAlignClick={handleCenterAlignClick}
              handleRightAlignClick={handleRightAlignClick}
              handleEditClick={handleClickEdit}
              handleAddClick={handleClickAddImage}
              alignState={alignState}
              showCaption={showCaption}
            />
          )}
          <ImageModal
            show={showEditModal}
            title={{ label: t('Edit Image') }}
            cancelLabel={t('Cancel')}
            saveLabel={t('Save')}
            onClose={handleCloseModal}
            images={imageUrls}
            dragToRepositionLabel={t('Drag the image to reposition')}
            errorLabel={t('Unable to crop the image. Please try again!')}
            isSavingImage={uploading}
            onSave={uploadEditedImage}
          />
        </Stack>
      )}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={e => uploadNewImage(e.target.files[0])}
        hidden
      />
    </>
  );
};
