import {
  genBeamData,
  genBeamStream,
  genContentBlock,
  genExtensionData,
  genProfileByDID,
} from '@akashaorg/af-testing';
import {
  GetAppsByIdDocument,
  GetBeamByIdDocument,
  GetBeamStreamDocument,
  GetContentBlockByIdDocument,
  GetProfileByDidDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { BEAM_FEED, BEAM_ID } from './constants';

export function getBeamFeedMocks() {
  const beamData = genBeamData({
    beamId: BEAM_ID,
    authorProfileDID: BEAM_FEED.authorProfileDID,
    reflectionsCount: BEAM_FEED.reflectionsCount,
  });
  const profileData = genProfileByDID({ profileDID: BEAM_FEED.authorProfileDID });
  return {
    mocks: [
      {
        request: {
          query: GetBeamStreamDocument,
        },
        variableMatcher: () => true,
        maxUsageCount: 2,
        result: {
          data: {
            node: genBeamStream({ beamId: BEAM_ID }),
          },
        },
      },
      {
        request: {
          query: GetProfileByDidDocument,
          variables: { id: BEAM_FEED.authorProfileDID },
        },
        result: {
          data: {
            node: profileData,
          },
        },
      },
      {
        request: {
          query: GetBeamByIdDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: beamData,
          },
        },
      },
      {
        request: {
          query: GetAppsByIdDocument,
          variables: {
            id: beamData.appID,
          },
        },
        result: {
          data: {
            node: genExtensionData({ appId: beamData.appID }),
          },
        },
      },
      ...beamData.content.map(block => ({
        request: {
          query: GetContentBlockByIdDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: genContentBlock({
              blockId: block.blockID,
              authorProfileDID: BEAM_FEED.authorProfileDID,
              content: BEAM_FEED.content,
            }),
          },
        },
      })),
    ],
    beamData,
    profileData,
  };
}
