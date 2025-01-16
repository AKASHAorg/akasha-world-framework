import { CreateFollowDocument } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import { genProfileByDID } from '@akashaorg/af-testing';

interface IGetFollowProfileMocks {
  profileDID: string;
  isFollowing: boolean;
}

export function getFollowProfileMocks({ profileDID, isFollowing }: IGetFollowProfileMocks) {
  const profileData = genProfileByDID({ profileDID });
  return [
    {
      request: {
        query: CreateFollowDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          setAkashaFollow: {
            document: {
              id: 'follow-id',
              did: {
                id: profileDID,
              },
              isFollowing,
              profile: profileData.akashaProfile,
            },
          },
        },
      },
    },
  ];
}
