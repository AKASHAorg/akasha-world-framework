import * as React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Tooltip from '@akashaorg/design-system-core/lib/components/Tooltip';
import { AddBlockButtonProps, AddBlock } from './add-block-button';
import { EditorUIState } from '../types';

export type TFooterProps = AddBlockButtonProps & {
  uiState: EditorUIState;
  tagsLabel: string;
  blocksLabel: string;
  publishLabel: string;
  saveTagsLabel: string;
  cancelLabel: string;
  maxBlocksWarningLabel: string;
  maxTags: number;
  maxBlocks: number;
  tagsNumber: number;
  blocksNumber: number;
  disableAddBlock: boolean;
  disableTagsSave: boolean;
  disableBeamPublishing: boolean;
  handleClickTags: () => void;
  handleClickSave: () => void;
  handleClickCancel: () => void;
  handleBeamPublish: () => void;
};

export const Footer: React.FC<TFooterProps> = props => {
  const {
    uiState,
    tagsLabel,
    blocksLabel,
    publishLabel,
    saveTagsLabel,
    cancelLabel,
    addBlockLabel,
    maxBlocksWarningLabel,
    maxTags,
    maxBlocks,
    tagsNumber,
    blocksNumber,
    disableAddBlock,
    disableTagsSave,
    disableBeamPublishing,
    handleClickTags,
    handleClickSave,
    handleClickCancel,
    handleBeamPublish,
    handleClickAddBlock,
  } = props;

  return (
    <Stack
      padding={16}
      fullWidth
      justify="between"
      align="center"
      direction="row"
      customStyle="rounded-b-2xl"
    >
      {/* render content based on the value of uiState */}
      {uiState === 'blocks' && (
        <>
          <Text
            variant="footnotes2"
            color="grey7"
          >{`${blocksNumber}/${maxBlocks} ${blocksLabel}`}</Text>
          <Button variant="secondary" size="md" label={cancelLabel} onClick={handleClickCancel} />
        </>
      )}
      {uiState === 'tags' && (
        <>
          <Text variant="footnotes2" color="grey7">{`${tagsNumber}/${maxTags} ${tagsLabel}`}</Text>
          <Stack direction="row" spacing="gap-2">
            <Button variant="text" label={cancelLabel} onClick={handleClickCancel} />
            <Button
              variant="primary"
              size="md"
              disabled={disableTagsSave}
              label={saveTagsLabel}
              onClick={handleClickSave}
            />
          </Stack>
        </>
      )}
      {uiState === 'editor' && (
        <>
          {disableAddBlock && (
            <Tooltip
              placement="top"
              content={maxBlocksWarningLabel}
              trigger="hover"
              contentCustomStyle="w-75"
            >
              <AddBlock disabled={disableAddBlock} addBlockLabel={addBlockLabel} />
            </Tooltip>
          )}
          {!disableAddBlock && (
            <AddBlock addBlockLabel={addBlockLabel} handleClickAddBlock={handleClickAddBlock} />
          )}
          <Stack direction="row" spacing="gap-4" align="center">
            <Stack direction="row" spacing="gap-2" align="center">
              <Stack
                align="center"
                justify="center"
                customStyle="w-[18px] h-[18px] rounded-[3px]"
                background={{ light: 'grey9', dark: 'grey5' }}
              >
                <Text
                  variant="footnotes2"
                  color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                >
                  {tagsNumber}
                </Text>
              </Stack>
              <Button variant="text" label={tagsLabel} onClick={handleClickTags} />
            </Stack>
            <Button
              variant="primary"
              size="md"
              disabled={disableBeamPublishing}
              label={publishLabel}
              onClick={handleBeamPublish}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};
