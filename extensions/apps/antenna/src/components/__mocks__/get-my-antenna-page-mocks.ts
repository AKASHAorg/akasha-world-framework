import { GetInterestsByDidDocument } from '@akashaorg/ui-core-hooks/src/generated';
import { AUTHENTICATED_DID } from './constants';
import { genExtensionData, genInterestsByDID } from '@akashaorg/af-testing';
import { GetAppsByIdDocument } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { genBeamData } from '@akashaorg/af-testing/lib/data-generator/beam';

export function getMyAntennaPageMocks() {
  const beamData = genBeamData({ beamId: 'test_beam_id', authorProfileDID: AUTHENTICATED_DID });
  return {
    mocks: [
      {
        request: {
          query: GetInterestsByDidDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: genInterestsByDID({ profileDID: AUTHENTICATED_DID }),
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
