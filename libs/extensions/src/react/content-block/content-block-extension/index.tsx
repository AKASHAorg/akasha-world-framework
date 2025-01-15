import React, {
  MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ParcelConfigObject } from 'single-spa';
import { hasOwn, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { BlockInstanceMethods, ContentBlockModes } from '@akashaorg/typings/lib/ui';
import { GetContentBlockByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { useGetContentBlockByIdLazyQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { RenderError } from './render-error';
import { RenderBlock } from './render-block';
import { BlockError } from '../block-error-card';
import { resolveConfigs } from '../resolve-configs';
import { MatchingBlock } from '../common.types';

export type ContentBlockExtensionProps = {
  blockRef?: React.RefObject<BlockInstanceMethods>;
  fetchError?: BlockError;
  contentLoadError?: BlockError;
  installButtonLabel: string;
  notInstalledTitle: string;
  notInstalledDescription1: string;
  notInstalledDescription2: string;
  // cache to prevent re-loading block config with the same block id
  cacheBlockConfig?: boolean;
  onError?: (error: Error) => void;
  onClickInstall: (e: React.SyntheticEvent) => void;
} & (
  | {
      blockID: string;
    }
  | {
      blockData: GetContentBlockByIdQuery['node'];
      matchingBlocks?: MatchingBlock[];
      error?: string;
      refreshLabel?: string;
      onRefresh?: () => void;
    }
);

export const ContentBlockExtension: React.FC<ContentBlockExtensionProps> = props => {
  const {
    blockRef,
    fetchError,
    contentLoadError,
    installButtonLabel,
    notInstalledTitle,
    notInstalledDescription1,
    notInstalledDescription2,
    cacheBlockConfig,
    onError,
    onClickInstall,
    ...remainingProps
  } = props;
  const { logger, getCorePlugins } = useRootComponentProps();
  const contentBlockStoreRef = useRef(getCorePlugins()?.contentBlockStore);
  const [hasContentLoadError, setHasContentLoadError] = useState(false);
  const [state, setState] = useState<{
    parcels: (MatchingBlock & { config: ParcelConfigObject })[];
  }>({
    parcels: [],
  });
  const [fetchBlockInfo, blockInfoQuery] = useGetContentBlockByIdLazyQuery({
    nextFetchPolicy: 'network-only',
  });
  // fetch data error
  const fetchDataError = useMemo(() => {
    if (blockInfoQuery.loading) return null;
    return hasOwn(remainingProps, 'blockData')
      ? remainingProps?.error
      : blockInfoQuery.error?.message;
  }, [remainingProps, blockInfoQuery]);
  // block data
  const blockData = useMemo(() => {
    if (hasOwn(remainingProps, 'blockData')) {
      if (remainingProps.blockData && hasOwn(remainingProps.blockData, 'id')) {
        return remainingProps.blockData;
      }
    }
    if (blockInfoQuery.data?.node && hasOwn(blockInfoQuery.data?.node, 'id')) {
      return blockInfoQuery.data?.node;
    }
    return null;
  }, [remainingProps, blockInfoQuery]);

  // find matching blocks
  const matchingBlocks: MatchingBlock[] = useMemo(() => {
    if (hasOwn(remainingProps, 'blockData') && remainingProps?.matchingBlocks)
      return remainingProps.matchingBlocks;
    return !blockData ? [] : contentBlockStoreRef.current.getMatchingBlocks(blockData);
  }, [blockData, remainingProps]);

  useLayoutEffect(() => {
    if (matchingBlocks && matchingBlocks.length !== state.parcels.length) {
      resolveConfigs({ matchingBlocks, mode: ContentBlockModes.READONLY, cache: cacheBlockConfig })
        .then(newBlocks => {
          setState({
            parcels: newBlocks,
          });
        })
        .catch(err => {
          setHasContentLoadError(true);
          logger.error('failed to load content blocks', err);
        });
    } else if (blockInfoQuery.called && !blockInfoQuery.loading) {
      setState({
        parcels: [],
      });
    }
  }, [
    logger,
    blockInfoQuery.called,
    blockInfoQuery.loading,
    matchingBlocks,
    state,
    cacheBlockConfig,
  ]);

  /**
   * remainingProps could have either just the blockID or other necessary data passed from the parent
   * Each of the variables and hooks below evaluates the props available in the remainingProps and acts accordingly.
   */
  // if only blockID, fetch the necessary data
  useEffect(() => {
    if (hasOwn(remainingProps, 'blockID') && !hasOwn(remainingProps, 'blockData')) {
      fetchBlockInfo({
        variables: {
          id: remainingProps.blockID,
        },
      }).catch(err => logger.error(`failed to fetch content block: ${JSON.stringify(err)}`));
      setHasContentLoadError(false);
    }
  }, [logger, fetchBlockInfo, remainingProps]);

  useEffect(() => {
    return () => {
      setState({
        parcels: [],
      });
    };
  }, []);

  const handleRefresh: MouseEventHandler<HTMLButtonElement> = React.useCallback(
    ev => {
      ev.stopPropagation();
      if (hasOwn(remainingProps, 'blockID')) {
        blockInfoQuery
          .refetch({
            id: remainingProps?.blockID,
          })
          .catch(err => logger.error('Error when refetching block: %o', err));
      }
      if (hasOwn(remainingProps, 'blockData')) {
        remainingProps.onRefresh?.();
      }
    },
    [blockInfoQuery, logger, remainingProps],
  );

  const appInfo = useMemo(() => {
    if (blockData) {
      return blockData.appVersion?.application;
    }
  }, [blockData]);

  if (hasContentLoadError || fetchDataError) {
    return (
      <RenderError
        fetchError={fetchError}
        contentLoadError={contentLoadError}
        fetchDataError={fetchDataError}
        hasContentLoadError={hasContentLoadError}
        refreshLabel={hasOwn(remainingProps, 'refreshLabel') ? remainingProps.refreshLabel : ''}
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <RenderBlock
      state={state}
      appInfo={appInfo}
      blockId={blockData?.id}
      blockRef={blockRef}
      blockData={blockData}
      matchingBlocks={matchingBlocks}
      notInstalledTitle={notInstalledTitle}
      installButtonLabel={installButtonLabel}
      notInstalledDescription1={notInstalledDescription1}
      notInstalledDescription2={notInstalledDescription2}
      onError={onError}
      onClickInstall={onClickInstall}
    />
  );
};
