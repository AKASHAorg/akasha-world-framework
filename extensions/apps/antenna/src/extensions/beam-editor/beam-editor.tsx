import React, { useEffect, useState, useRef, ChangeEvent, KeyboardEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hasOwn, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { type ContentBlock } from '@akashaorg/typings/lib/ui';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { XMarkIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import SearchBar from '@akashaorg/design-system-components/lib/components/SearchBar';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import UnsavedChangesModal from '@akashaorg/design-system-components/lib/components/UnsavedChangesModal';
import { EditorBlockExtension } from '@akashaorg/ui-lib-extensions/lib/react/content-block';
import { Header } from './header';
import { Footer } from './footer';
import { BlockHeader } from '@akashaorg/design-system-components/lib/components/BlockHeader';
import { useBlocksPublishing } from './use-blocks-publishing';
import { useGetProfileByDidSuspenseQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { EditorUIState } from './types';

export const BeamEditor: React.FC = () => {
  const [uiState, setUiState] = useState<EditorUIState>('editor');
  const [focusedBlock, setFocusedBlock] = useState(null);
  const [tagValue, setTagValue] = useState('');
  const [editorTags, setEditorTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isNsfw, setIsNsfw] = useState(false);
  const [nsfwBlocks, setNsfwBlocks] = useState(new Map<number, boolean>());
  const [disablePublishing, setDisablePublishing] = useState(true);
  const [newUrl, setNewUrl] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation('app-antenna');

  const { getCorePlugins } = useRootComponentProps();

  /*
   * get the logged-in user info and info about their profile's NSFW property
   */
  const {
    data: { authenticatedDID, isAuthenticating: authenticating },
  } = useAkashaStore();
  const { data } = useGetProfileByDidSuspenseQuery({
    fetchPolicy: 'cache-first',
    variables: {
      id: authenticatedDID,
    },
    skip: !authenticatedDID || authenticating,
  });

  const {
    availableBlocks,
    createContentBlocks,
    isPublishing,
    blocksInUse,
    maxAllowedBlocks,
    maxAllowedTags,
    addBlockToList,
    removeBlockFromList,
    increaseBlockOrder,
    decreaseBlockOrder,
    updateBlockDisablePublishState,
  } = useBlocksPublishing({
    onComplete: beamData => {
      getCorePlugins().routing.navigateTo({
        appName: '@akashaorg/app-antenna',
        getNavigationUrl: navRoutes => `${navRoutes.Beam}/${beamData.document.id}`,
      });
    },
  });

  const { akashaProfile: profileData } =
    data?.node && hasOwn(data.node, 'akashaProfile') ? data.node : { akashaProfile: null };

  const disableBeamPublishing = useMemo(
    () => isPublishing || disablePublishing,
    [disablePublishing, isPublishing],
  );

  useEffect(() => {
    if (profileData?.nsfw) {
      setIsNsfw(true);
    }
  }, [profileData]);

  /**
   * focus the last block after adding or removing a block
   */
  useEffect(() => {
    if (blocksInUse.length > 0) {
      setFocusedBlock(blocksInUse[blocksInUse.length - 1]?.key);
    }
    // blocksInUse changes when you type due to checking for disablePublishing state
    // that's why we only care about the length here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksInUse.length]);

  useEffect(() => {
    if (blocksInUse.length) {
      bottomRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });
    }
  }, [blocksInUse.length]);

  useEffect(() => {
    if (blocksInUse.some(block => block.disablePublish === true)) {
      setDisablePublishing(true);
    } else {
      setDisablePublishing(false);
    }
  }, [blocksInUse]);

  useEffect(() => {
    let navigationSubscribe: () => void;
    /**
     * when beam publishing is not disabled;
     * 1. call cancel navigation method from routing plugin
     * 2. set the new url from the callback fn.
     */
    if (!disableBeamPublishing) {
      navigationSubscribe = getCorePlugins().routing.cancelNavigation(
        !disableBeamPublishing,
        url => {
          setNewUrl(url);
        },
      );
    }

    return () => {
      if (typeof navigationSubscribe === 'function') {
        navigationSubscribe();
      }
    };
  }, [disableBeamPublishing]);

  const onBlockSelectAfter = (newSelection: ContentBlock) => {
    if (!newSelection?.propertyType) {
      return;
    }
    addBlockToList({ propertyType: newSelection.propertyType, appName: newSelection.appName });
  };

  const handleBeamPublish = () => {
    createContentBlocks(isNsfw, editorTags, nsfwBlocks);
  };

  const handleNsfwCheckbox = () => {
    /*
     * If the profile is marked as NSFW, Beam NSFW checkbox should be marked as checked by default
     * and the user shouldn't be able to change it
     */
    if (profileData?.nsfw) return;

    setIsNsfw(!isNsfw);
    const numberOfBlocks = blocksInUse.length;
    const newNsfwBlocks = new Map();

    if (!isNsfw) {
      for (let key = 0; key < numberOfBlocks; key++) {
        newNsfwBlocks.set(key, true);
      }
      setNsfwBlocks(newNsfwBlocks);
      return;
    }

    for (let key = 0; key < numberOfBlocks; key++) {
      newNsfwBlocks.set(key, false);
    }
    setNsfwBlocks(newNsfwBlocks);
  };

  const handleAddBlockBtn = () => {
    setUiState('blocks');
  };

  const handleTagsBtn = () => {
    setUiState('tags');
    /**
     * copy existing tags, if any,
     * to new tags state
     */
    if (editorTags.length > 0) {
      setNewTags(editorTags);
    }
  };
  const handleAddBlock = selectedBlock => {
    const newBlock = availableBlocks.find(
      block =>
        block.propertyType === selectedBlock.propertyType &&
        block.appName === selectedBlock.appName,
    );
    onBlockSelectAfter(newBlock);
    setUiState('editor');
  };

  const targetKeys = [' ', ',', 'Enter'];
  const targetCodes = ['Space', 'Comma', 'Enter'];
  const allTags = [...new Set([...editorTags, ...newTags])];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tag = e.currentTarget.value;
    if (targetKeys.includes(tag.charAt(tag.length - 1))) return;
    setTagValue(tag);
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (newTags.length === 10) {
      setErrorMessage('Tags limit reached');
    } else if (tagValue.length > 30) {
      setErrorMessage('Tag is over the 30 characters limit');
    } else if (newTags.includes(tagValue)) {
      setErrorMessage('Tag added already, please try a different one');
    } else {
      setErrorMessage(null);
    }
    if (targetKeys.includes(e.key) || targetCodes.includes(e.code)) {
      addTag();
    }
  };

  const addTag = () => {
    /**
     * if tag length is at least 2 and total number of tags
     * is less than max specified and tag is not previously
     * added
     */
    if (
      tagValue.length > 2 &&
      tagValue.length <= 30 &&
      allTags.length < 10 &&
      !newTags.includes(tagValue)
    ) {
      setNewTags(prev => [...prev, tagValue]);
      setTagValue('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    if (newTags.includes(tag)) {
      setNewTags(newTags.filter(_tag => _tag !== tag));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleClickSave = () => {
    setEditorTags(newTags);
    setNewTags([]);
    setUiState('editor');
  };

  const handleClickCancel = () => {
    /**
     * if uiState is 'tags', reset newTags and tagValue states,
     * then set uiState to 'editor'
     */
    if (uiState === 'tags') {
      setNewTags([]);
      setTagValue('');
    }
    setUiState('editor');
  };

  const blocksWithActiveNsfw = [...nsfwBlocks].filter(([, value]) => !!value);

  useEffect(() => {
    if (blocksWithActiveNsfw.length && blocksWithActiveNsfw.length >= 1) {
      setIsNsfw(true);
      return;
    }
    /*
     *  If the profile is marked as NSFW, the beam is automatically marked as NSFW,
     *  so there is no need to check for blocks
     */
    if (!profileData?.nsfw) setIsNsfw(false);
  }, [blocksWithActiveNsfw, blocksInUse, profileData?.nsfw]);
  /*
   * after a block is focused by clicking on it, this handles
   * propagating the state to the block instance through its exposed method
   */
  useEffect(() => {
    blocksInUse.forEach(block => {
      if (block.blockRef?.current?.hasOwnProperty('handleFocusBlock')) {
        if (block.key === focusedBlock) {
          block.blockRef?.current?.handleFocusBlock(true);
        } else {
          block.blockRef?.current?.handleFocusBlock(false);
        }
      }
    });
  }, [blocksInUse, focusedBlock]);

  const handleLeavePage = () => {
    /**
     * get the appName and navigationUrl from the newUrl state
     */
    const splitPathNames = new URL(newUrl).pathname.split('/');
    const appName = splitPathNames.slice(1, 3).join('/');
    const navigationUrl = `/${splitPathNames.slice(3, splitPathNames.length).join('/')}`;
    // reset states
    setDisablePublishing(true);
    setNewUrl(null);
    // navigate away from editor to the desired url.
    getCorePlugins().routing.navigateTo({
      appName: appName,
      getNavigationUrl: () => navigationUrl,
    });
  };

  const handleModalClose = () => setNewUrl(null);

  return (
    <Card padding={0} customStyle="divide(y grey9 dark:grey3) h-[80vh] justify-between">
      {!!newUrl && (
        <UnsavedChangesModal
          showModal={!!newUrl}
          cancelButtonLabel={t('Cancel')}
          leavePageButtonLabel={t('Leave page')}
          title={t('Unsaved changes')}
          description={t(
            "Are you sure you want to leave this page? The changes you've made will not be saved.",
          )}
          handleModalClose={handleModalClose}
          handleLeavePage={handleLeavePage}
        />
      )}
      <Header
        uiState={uiState}
        addTagsLabel={t('Add Tags')}
        addBlockLabel={t('Add a Block')}
        beamEditorLabel={t('Beam Editor')}
        checkboxIsSelected={isNsfw}
        checkboxIsDisabled={profileData?.nsfw}
        onSelectCheckbox={handleNsfwCheckbox}
      />
      <Stack customStyle="relative h-full overflow-hidden">
        <Stack customStyle="overflow-y-auto overflow-x-hidden h-full">
          {blocksInUse.map((block, idx) => (
            <Card
              key={block.key}
              id={`${block.propertyType}-${idx}`}
              type="plain"
              onClick={() => setFocusedBlock(block.key)}
            >
              <Stack padding={16} direction="column" spacing="gap-2">
                <BlockHeader
                  icon={block.icon}
                  blockCreationStatus={block.status}
                  errorLabel={t('Block creation failed.')}
                  successLabel={t('Block Created Successfully!')}
                  creatingBlockLabel={t('Creating Block...')}
                  retryLabel={t('Retry')}
                  handleRetry={handleBeamPublish}
                  blockOrder={block.order}
                  totalBlocksLength={blocksInUse.length}
                  handleIncreaseBlockOrder={increaseBlockOrder}
                  handleDecreaseBlockOrder={decreaseBlockOrder}
                  handleRemoveBlock={removeBlockFromList}
                  handleNsfwChange={() => {
                    setNsfwBlocks(new Map(nsfwBlocks.set(idx, !nsfwBlocks.get(idx))));
                  }}
                  isNsfwCheckboxSelected={!!nsfwBlocks.get(idx)}
                  isFocusedBlock={focusedBlock === block.key}
                />
                <EditorBlockExtension
                  appName={block.appName}
                  propertyType={block.propertyType}
                  externalHandler={value => updateBlockDisablePublishState(value, block.key)}
                  blockRef={block.blockRef}
                />
              </Stack>
            </Card>
          ))}
          <div ref={bottomRef} />
        </Stack>
        {uiState === 'blocks' && (
          <Stack
            background={{ light: 'white', dark: 'grey2' }}
            customStyle="absolute overflow-auto top-0 left-0 h-full w-full divide(y grey8 dark:grey5) z-[99]
            "
          >
            {blocksInUse.length > 9 && (
              <button onClick={handleClickCancel}>
                <Stack padding={32} align="center" justify="center" fullWidth>
                  <Text>{t('You have reached the maximum number of blocks for a beam.')}</Text>
                </Stack>
              </button>
            )}
            {blocksInUse.length < 10 &&
              availableBlocks.map((block, idx) => (
                <button key={idx} onClick={() => handleAddBlock(block)}>
                  <Stack padding={16} fullWidth direction="row" justify="between" align="center">
                    <Stack direction="row" align="center" spacing="gap-2">
                      <Stack
                        align="center"
                        justify="center"
                        customStyle={'h-8 w-8 group relative rounded-full bg(grey9 dark:grey5)'}
                      >
                        <Icon size="sm" icon={block.icon} />
                      </Stack>
                      <Text>{block.displayName}</Text>
                    </Stack>
                  </Stack>
                </button>
              ))}
          </Stack>
        )}
        {uiState === 'tags' && (
          <Stack
            background={{ light: 'white', dark: 'grey2' }}
            customStyle="absolute top-0 left-0 h-full w-full overflow-auto z-[99]"
          >
            <Stack padding={16} spacing="gap-4">
              <Stack direction="row" spacing="gap-x-1" align="center">
                <Text variant="h6">{t('Beam Tags')}</Text>
                <Text variant="footnotes2" color="grey7">
                  ({t('10 max')}.)
                </Text>
              </Stack>
              <Text variant="subtitle2" color="grey7">
                {t(
                  'Use up to 10 tags to categorize your posts on AKASHA World, helping others discover your content more easily.',
                )}
              </Text>
              <Stack spacing="gap-y-1">
                <SearchBar
                  inputValue={tagValue}
                  inputPlaceholderLabel={t('Search for tags')}
                  onInputChange={handleChange}
                  onKeyUp={handleKeyUp}
                  onSearch={() => {
                    /** */
                  }}
                  fullWidth={true}
                  customStyle={`${
                    errorMessage
                      ? 'focus-within:border-errorLight dark:focus-within:border-errorDark))'
                      : ''
                  }`}
                />

                {errorMessage && (
                  <Text variant="footnotes2" color={{ light: 'errorLight', dark: 'errorDark' }}>
                    {t('{{errorMessage}}', { errorMessage })}
                  </Text>
                )}
              </Stack>
              {newTags.length === 0 && (
                <Text variant="body2" weight="bold">
                  {t("You haven't added any tags yet")}
                </Text>
              )}
              <Stack fullWidth direction="row" align="center" justify="end" spacing="gap-2">
                <Button
                  variant="text"
                  label={t('Clear All')}
                  disabled={!newTags.length}
                  onClick={() => setNewTags([])}
                />
                <Button
                  variant="secondary"
                  label={t('Add')}
                  disabled={
                    tagValue.length < 3 || tagValue.length > 30 || newTags.includes(tagValue)
                  }
                  onClick={addTag}
                />
              </Stack>
              <Stack direction="row" spacing="gap-2" customStyle="flex-wrap">
                {newTags.map((tag, index) => (
                  <Pill
                    key={index}
                    label={tag}
                    active={!editorTags.includes(tag)}
                    icon={<XMarkIcon />}
                    iconDirection="right"
                    onPillClick={() => handleDeleteTag(tag)}
                    type="action"
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
      <Footer
        uiState={uiState}
        tagsLabel={t('Tags')}
        blocksLabel={t('Blocks')}
        publishLabel={t('Beam it')}
        saveTagsLabel={t('Save')}
        cancelLabel={t('Cancel')}
        addBlockLabel={t('Add a Block')}
        maxBlocksWarningLabel={t('You have reached the maximum number of blocks for a beam.')}
        maxTags={maxAllowedTags}
        maxBlocks={maxAllowedBlocks}
        tagsNumber={uiState === 'tags' ? newTags.length : allTags.length}
        blocksNumber={blocksInUse.length}
        disableAddBlock={blocksInUse.length === maxAllowedBlocks}
        disableTagsSave={isPublishing || JSON.stringify(newTags) === JSON.stringify(editorTags)}
        disableBeamPublishing={disableBeamPublishing}
        handleClickTags={handleTagsBtn}
        handleClickSave={handleClickSave}
        handleClickCancel={handleClickCancel}
        handleBeamPublish={handleBeamPublish}
        handleClickAddBlock={handleAddBlockBtn}
      />
    </Card>
  );
};
