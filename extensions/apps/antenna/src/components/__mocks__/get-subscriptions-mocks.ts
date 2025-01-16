import { genInterestsByDID } from '@akashaorg/af-testing';
import {
  CreateInterestsDocument,
  UpdateInterestsDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { AUTHENTICATED_DID } from './constants';

interface IGetSubscriptionsMocks {
  tag: string;
}

export function getSubscriptionsMocks({ tag }: IGetSubscriptionsMocks) {
  return [
    {
      request: {
        query: CreateInterestsDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          createAkashaProfileInterests: {
            document: genInterestsByDID({
              profileDID: AUTHENTICATED_DID,
              tag,
            }).akashaProfileInterests,
            clientMutationId: '',
          },
        },
      },
    },
    {
      request: {
        query: UpdateInterestsDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          updateAkashaProfileInterests: {
            document: genInterestsByDID({
              profileDID: AUTHENTICATED_DID,
              tag,
            }).akashaProfileInterests,
            clientMutationId: '',
          },
        },
      },
    },
  ];
}
