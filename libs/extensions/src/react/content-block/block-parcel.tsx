import React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { RootParcel } from '../root-parcel';
import { MatchingBlock } from './common.types';
import { BlockInstanceMethods, ContentBlockModes } from '@akashaorg/typings/lib/ui';
import { ParcelConfigObject } from 'single-spa';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';

export type BlockParcelProps = {
  matchingBlock: MatchingBlock & { config: ParcelConfigObject };
  blockId: string;
  index: number;
  blockRef?: React.RefObject<BlockInstanceMethods>;
  onError?: (error: Error) => void;
} & (
  | { mode: ContentBlockModes.READONLY }
  | {
      mode: ContentBlockModes.EDIT;
      externalHandler?: (value: never) => void;
    }
);

export const BlockParcel: React.FC<BlockParcelProps> = props => {
  const { matchingBlock, blockId, index, blockRef, onError, ...rest } = props;
  const { getContext, logger } = useRootComponentProps();
  const handleParcelError = React.useCallback(
    (parcelName: string) => {
      return error => {
        if (logger) logger.error(`error in parcel ${parcelName}: ${error}`);
        onError?.(error);
      };
    },
    [logger, onError],
  );

  return (
    <Stack
      fullWidth
      id={`${rest.mode}_${matchingBlock.blockInfo.propertyType}_${blockId}_${index}`}
      key={`${rest.mode}_${matchingBlock.blockInfo.propertyType}_${blockId}_${index}`}
    >
      <RootParcel
        config={{
          ...matchingBlock.config,
          name: `${matchingBlock.blockInfo.appName}_${matchingBlock.blockInfo.propertyType}_${blockId}_${index}`,
        }}
        {...getContext()}
        blockInfo={{
          ...matchingBlock.blockInfo,
          mode: rest.mode,
          externalHandler: rest.mode === ContentBlockModes.EDIT ? rest?.externalHandler : null,
        }}
        blockData={matchingBlock.blockData}
        blockRef={blockRef}
        content={matchingBlock.content}
        handleError={handleParcelError(
          `${matchingBlock.blockInfo.appName}_${matchingBlock.blockInfo.propertyType}_${blockId}_${index}`,
        )}
      />
    </Stack>
  );
};
