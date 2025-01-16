import getSDK from '@akashaorg/core-sdk';
import { ContentBlockModes } from '@akashaorg/typings/lib/ui';
import { MatchingBlock } from './common.types';
import { hasOwn } from '@akashaorg/ui-core-hooks';

interface IResolveConfigs {
  matchingBlocks: MatchingBlock[];
  mode: ContentBlockModes;
  //Cache to prevent re-loading block config with the same block id
  cache?: boolean;
}

const sdk = getSDK();
const uiStash = sdk.services.stash.getUiStash();

export const resolveConfigs = async ({ matchingBlocks, mode, cache }: IResolveConfigs) => {
  const newBlocks = [];
  for (const block of matchingBlocks) {
    const config = await getConfig({ block, mode, cache });
    newBlocks.push({ ...block, config });
  }
  return newBlocks;
};

interface IConfig {
  block: MatchingBlock;
  mode: ContentBlockModes;
  cache?: boolean;
}

const getConfig = async ({ block, mode, cache }: IConfig) => {
  if (cache) {
    let id = null;
    if (block?.blockData && hasOwn(block.blockData, 'id')) {
      id = `${block.blockInfo.appName}-${block.blockData.id}`;
    }
    if (!uiStash.has(id)) {
      const config = await block.blockInfo.loadingFn({
        blockInfo: { ...block.blockInfo, mode },
        blockData: block.blockData,
      })();
      uiStash.set(id, config);
    }
    return uiStash.get(id);
  }
  return block.blockInfo.loadingFn({
    blockInfo: { ...block.blockInfo, mode },
    blockData: block.blockData,
  })();
};
