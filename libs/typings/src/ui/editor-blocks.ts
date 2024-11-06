import React from 'react';
import singleSpa from 'single-spa';
import { IRootComponentProps } from './root-component';
import { GetContentBlockByIdQuery } from '../sdk/graphql-operation-types-new';
import { BlockLabeledValue } from '../sdk/graphql-types-new';

/**
 * Enum defining content block modes
 **/
export const enum ContentBlockModes {
  EDIT = 'edit-mode',
  READONLY = 'read-only-mode',
}

/**
 * Type defining block info
 * @internal
 **/
type BlockInfo = {
  mode: ContentBlockModes;
};

/**
 * Type defining configuration object for loading content blocks
 */
export type ContentBlockConfig = {
  propertyType: string;
  icon?: React.ReactElement;
  displayName: string;
  externalHandler?: (value: boolean) => void;
  loadingFn: (options: {
    blockInfo: BlockInfo;
    blockData: GetContentBlockByIdQuery['node'];
  }) => () => Promise<singleSpa.ParcelConfigObject<ContentBlockRootProps>>;
};

/**
 * Type defining content block
 */
export type ContentBlock = {
  appName: string;
  propertyType: string;
  order: number;
};

/**
 * Type defining props that will be passed to the content block's root React component.
 */
export type ContentBlockRootProps = IRootComponentProps & {
  blockInfo: Omit<ContentBlock, 'loadingFn'> & ContentBlockConfig & { mode: ContentBlockModes };
  blockData: GetContentBlockByIdQuery['node'];
  content: BlockLabeledValue;
};

/**
 * Type defining params of a function that creates content block
 **/
export type CreateContentBlock = {
  nsfw: boolean;
};

/**
 * Type defining methods of block instance object used by an editor when the content block is in edit mode
 */
export type BlockInstanceMethods = {
  /**
   * createBlock is called when the user submits (publish) a Beam.
   * It returns a promise that when resolved, should contain the following properties:
   * response - an object containing the blockID and optionally an error message;
   * blockInfo - the block's information (received as React props);
   * retryCount - optional number (retry counter)
   * each editor type block can expose the mentions added to it by this method
   * so that it can be accesed on beam publishing and added to the beam model
   */
  createBlock: (arg: CreateContentBlock) => Promise<{
    response: { blockID: string; error?: string };
    blockInfo: BlockInfo;
    retryCount?: number;
    editorMentions?: string[];
  }>;
  /**
   * If the createBlock fails, or returns an error message, the editor
   * will show a button to manually retry block creation.
   * This method has the same signature as `createBlock`
   */
  retryBlockCreation: (arg: CreateContentBlock) => Promise<{
    response: { blockID: string; error?: string };
    blockInfo: BlockInfo;
    retryCount?: number;
  }>;
  /**
   * Function that will be called on focus and blur events.
   * These events are handled by the editor and passed down to the block via this method.
   * Useful to show additional controls like a wysiwyg editor's text formatting tools.
   */
  handleFocusBlock?: (focus: boolean) => void;
};

/**
 * Local content block is `created` locally but not yet published.
 * This is the case of a block added to the editor
 **/
export type LocalContentBlock = {
  appName: string;
  propertyType: string;
};

/**
 * A content block that matches a particular slot in the beam
 * This is used to match the renderer of that block with the data from the beam
 **/
export type MatchingBlock = {
  /** the config of the content block, as defined in the registration */
  blockInfo: ContentBlockConfig & { appName: string };
  blockData?: unknown;
  content?: unknown;
};

/**
 * Interface defining content block state store defined as a plugin
 **/
export interface IContentBlockStorePlugin {
  registerContentBlocks(blockInfos: (ContentBlockConfig & { appName: string })[]): void;
  registerContentBlock(blockInfo: ContentBlockConfig & { appName: string }): void;
  getInfos(): Omit<
    ContentBlockConfig & {
      appName: string;
    },
    'loadingFn'
  >[];

  getMatchingBlocks: (
    blockInfo: LocalContentBlock | GetContentBlockByIdQuery['node'],
  ) => MatchingBlock[];
}
