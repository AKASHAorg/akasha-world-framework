import {
  genBeamData,
  genBeamStream,
  genContentBlock,
  genProfileByDID,
  genReflectionData,
} from '@akashaorg/af-testing';
import {
  GetBeamByIdDocument,
  GetBeamStreamDocument,
  GetContentBlockByIdDocument,
  GetProfileByDidDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { BEAM_FEED, BEAM_SECTION, REFLECTION_ID, REFLECTION_SECTION } from './constants';

export interface IGetReflectionSectionMocks {
  isBeamActive?: boolean;
}

export function getReflectionSectionMocks(params?: IGetReflectionSectionMocks) {
  const reflectionData = genReflectionData({
    reflectionId: REFLECTION_ID,
    authorProfileDID: REFLECTION_SECTION.authorProfileDID,
    content: REFLECTION_SECTION.content,
  });
  const beamData = genBeamData({
    beamId: reflectionData.beam.id,
    active: params?.isBeamActive,
    authorProfileDID: BEAM_SECTION.authorProfileDID,
    reflectionsCount: BEAM_SECTION.reflectionsCount,
  });
  const profileData = genProfileByDID({ profileDID: REFLECTION_SECTION.authorProfileDID });
  return {
    mocks: [
      {
        request: {
          query: GetProfileByDidDocument,
          variables: { id: REFLECTION_SECTION.authorProfileDID },
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
          query: GetBeamStreamDocument,
        },
        variableMatcher: () => true,
        // maxUsageCount: 3,
        result: {
          data: {
            node: genBeamStream({ beamId: reflectionData.beam.id }),
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
    reflectionData,
    profileData,
  };
}
