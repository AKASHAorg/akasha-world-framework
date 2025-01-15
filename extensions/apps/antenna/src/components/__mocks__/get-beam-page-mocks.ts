import {
  genBeamData,
  genContentBlock,
  genExtensionData,
  genProfileByDID,
} from '@akashaorg/af-testing';
import {
  GetProfileByDidDocument,
  GetContentBlockByIdDocument,
  GetAppsByIdDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { AUTHENTICATED_DID, BEAM_ID, BEAM_SECTION } from './constants';

export function getBeamSectionMocks() {
  const beamData = genBeamData({
    beamId: BEAM_ID,
    authorProfileDID: BEAM_SECTION.authorProfileDID,
    reflectionsCount: BEAM_SECTION.reflectionsCount,
  });

  const profileData = genProfileByDID({ profileDID: BEAM_SECTION.authorProfileDID });
  return {
    mocks: [
      {
        request: {
          query: GetProfileByDidDocument,
          variables: { id: BEAM_SECTION.authorProfileDID },
        },
        result: {
          data: {
            node: profileData,
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
              authorProfileDID: BEAM_SECTION.authorProfileDID,
              content: BEAM_SECTION.content,
            }),
          },
        },
      })),
    ],
    beamData,
    profileData,
  };
}
