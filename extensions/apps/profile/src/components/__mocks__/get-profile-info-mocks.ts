import { genProfileByDID, genFollowDocumentByDid } from '@akashaorg/af-testing';

import {
  GetProfileByDidDocument,
  GetFollowDocumentsByDidDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';

type IGetProfileInfoMocks = {
  profileDID: string;
  nsfw?: boolean;
};

export function getProfileInfoMocks({ profileDID, nsfw }: IGetProfileInfoMocks) {
  const profileData = genProfileByDID({ profileDID, nsfw });
  return {
    mocks: [
      {
        request: {
          query: GetProfileByDidDocument,
          variables: { id: profileDID },
        },
        result: {
          data: {
            node: profileData,
          },
        },
      },
    ],
    profileData,
  };
}

export function getEmptyProfileMock(profileDID: string) {
  return [
    {
      request: {
        query: GetProfileByDidDocument,
        variables: { id: profileDID },
      },
      result: {
        data: {
          node: {
            akashaProfile: null,
            isViewer: false,
            __typename: 'CeramicAccount',
          },
        },
      },
    },
  ];
}

interface IGetFollowMock {
  isFollowing: boolean;
  profileDID: string;
}

export function getFollowMock(params?: IGetFollowMock) {
  const followDocument = params
    ? genFollowDocumentByDid({
        profile: { profileDID: params.profileDID },
        isFollowing: params.isFollowing,
      })
    : genFollowDocumentByDid();
  return [
    {
      request: {
        query: GetFollowDocumentsByDidDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          node: followDocument,
        },
      },
    },
  ];
}
