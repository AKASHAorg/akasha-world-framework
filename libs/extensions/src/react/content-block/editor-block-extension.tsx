import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import TextLine from '@akashaorg/design-system-core/lib/components/TextLine';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { ContentBlockModes, BlockInstanceMethods } from '@akashaorg/typings/lib/ui';
import { ParcelConfigObject } from 'single-spa';
import { BlockParcel } from './block-parcel';
import { MatchingBlock } from './common.types';
import { resolveConfigs } from './resolve-configs';

export type EditorBlockExtensionProps = {
  blockRef?: React.RefObject<BlockInstanceMethods>;
  propertyType: string;
  appName: string;
  onError?: (error: Error) => void;
  externalHandler?: (value: never) => void;
};

export const EditorBlockExtension: React.FC<EditorBlockExtensionProps> = props => {
  const { blockRef, propertyType, appName, onError, externalHandler } = props;
  const { logger, getCorePlugins } = useRootComponentProps();
  const contentBlockStoreRef = useRef(getCorePlugins()?.contentBlockStore);
  const [state, setState] = useState<{
    parcels: (MatchingBlock & { config: ParcelConfigObject })[];
    isMatched: boolean;
  }>({
    parcels: [],
    isMatched: false,
  });

  const matchingBlocks: MatchingBlock[] = useMemo(() => {
    if (!contentBlockStoreRef.current) return [];
    return contentBlockStoreRef.current.getMatchingBlocks({
      appName: appName,
      propertyType: propertyType,
    });
  }, [appName, propertyType]);

  useLayoutEffect(() => {
    if (
      matchingBlocks &&
      matchingBlocks.length &&
      matchingBlocks.length !== state.parcels.length &&
      !state.isMatched
    ) {
      resolveConfigs({ matchingBlocks, mode: ContentBlockModes.EDIT })
        .then(newBlocks => {
          setState({
            parcels: newBlocks,
            isMatched: true,
          });
        })
        .catch(err =>
          logger.error(`failed to load content blocks in edit mode: ${JSON.stringify(err)}`),
        );
    } else if (matchingBlocks && !matchingBlocks.length && !state.isMatched) {
      setState({
        parcels: [],
        isMatched: true,
      });
    }
  }, [logger, matchingBlocks, state]);

  useEffect(() => {
    return () => {
      setState({
        isMatched: false,
        parcels: [],
      });
    };
  }, []);

  return (
    <>
      {!state.parcels.length && !state.isMatched && (
        <Stack fullWidth={true} spacing="gap-y-1" customStyle="mb-2">
          <TextLine animated={true} width="w-full" />
          <TextLine animated={true} width="w-2/3" />
        </Stack>
      )}
      {state.parcels.map((matchingBlock, index) => {
        return (
          <BlockParcel
            key={index}
            mode={ContentBlockModes.EDIT}
            matchingBlock={matchingBlock}
            blockId="0"
            index={index}
            blockRef={blockRef}
            externalHandler={externalHandler}
            onError={onError}
          />
        );
      })}
    </>
  );
};
