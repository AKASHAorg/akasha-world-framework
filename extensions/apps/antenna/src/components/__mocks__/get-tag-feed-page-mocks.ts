import {
  genBeamData,
  genExtensionData,
  genIndexedStreamCount,
  genInterestsByDID,
} from '@akashaorg/af-testing';
import {
  GetAppsByIdDocument,
  GetIndexedStreamCountDocument,
  GetInterestsByDidDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { AUTHENTICATED_DID } from './constants';

interface IGetTagFeedPageMocks {
  count: number;
  tag?: string;
}

export function getTagFeedPageMocks({ count, tag }: IGetTagFeedPageMocks) {
  const beamData = genBeamData({ beamId: 'beam1', authorProfileDID: AUTHENTICATED_DID });
  return {
    mocks: [
      {
        request: {
          query: GetIndexedStreamCountDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: genIndexedStreamCount({ count }),
          },
        },
      },
      {
        request: {
          query: GetInterestsByDidDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: genInterestsByDID({ profileDID: AUTHENTICATED_DID, tag }),
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
    ],
  };
}
