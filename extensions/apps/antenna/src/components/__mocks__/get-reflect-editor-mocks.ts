import { genReflectionData } from '@akashaorg/af-testing';
import {
  CreateReflectDocument,
  GetFollowingListByDidDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';

interface IGetReflectEditorMocks {
  reflectionId: string;
  authorProfileDID: string;
  content: string;
  isReply?: boolean;
  reflection?: string | null;
}

export function getReflectEditorMocks({
  reflectionId,
  authorProfileDID,
  content,
  isReply,
  reflection,
}: IGetReflectEditorMocks) {
  return [
    {
      delay: 100,
      request: {
        query: CreateReflectDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          createAkashaReflect: {
            document: genReflectionData({
              reflectionId,
              authorProfileDID,
              content,
              isReply,
              reflection,
            }),
            clientMutationId: '',
          },
        },
      },
    },
    {
      request: {
        query: GetFollowingListByDidDocument,
      },
      variableMatcher: () => true,
      maxUsageCount: 3,
      result: {
        data: {
          node: {
            akashaFollowList: {
              edges: [],
              pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
                __typename: 'PageInfo',
              },
              __typename: 'AkashaFollowConnection',
            },
            isViewer: false,
            __typename: 'CeramicAccount',
          },
        },
      },
    },
  ];
}
