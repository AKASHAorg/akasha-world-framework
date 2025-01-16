import {
  genReflectionStream,
  genReflectionData,
  genProfileByDID,
  genReflectReflection,
} from '@akashaorg/af-testing';
import {
  GetProfileByDidDocument,
  GetReflectionStreamDocument,
  GetReflectionByIdDocument,
  GetReflectReflectionsDocument,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';

interface IGetReflectionFeedMocks {
  authorProfileDID: string;
  beamId: string;
  reflectionId: string;
  reflectionContent: string;
  replyTo?: string;
  isReply?: boolean;
  preview?: {
    reflectionId: string;
    content: string;
  };
}

export function getReflectFeedMocks({
  authorProfileDID,
  beamId,
  reflectionId,
  reflectionContent,
  replyTo,
  isReply,
  preview,
}: IGetReflectionFeedMocks) {
  const profileData = genProfileByDID({ profileDID: authorProfileDID });
  const reflectionData = genReflectionData({
    reflectionId,
    authorProfileDID,
    content: reflectionContent,
  });
  const previewData = preview
    ? genReflectReflection({
        beamId,
        reflectionId: preview.reflectionId,
        authorProfileDID,
        content: preview.content,
      })
    : {
        akashaReflectIndex: {
          edges: [],
          pageInfo: {
            startCursor: null,
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            __typename: 'PageInfo',
          },
          __typename: 'AkashaReflectConnection',
        },
      };
  return {
    mocks: [
      {
        request: {
          query: GetProfileByDidDocument,
          variables: {
            id: authorProfileDID,
          },
        },
        result: {
          data: {
            node: profileData,
          },
        },
      },
      {
        request: {
          query: GetReflectionStreamDocument,
        },
        variableMatcher: () => true,
        result: {
          data: {
            node: genReflectionStream({ beamId, reflectionId, replyTo, isReply }),
          },
        },
      },
      {
        request: {
          query: GetReflectionByIdDocument,
          variables: {
            id: reflectionId,
          },
        },
        result: {
          data: {
            node: reflectionData,
          },
        },
      },
      {
        request: {
          query: GetReflectReflectionsDocument,
        },
        variableMatcher: () => true,
        result: {
          data: previewData,
        },
      },
    ],
    profileData,
    reflectionData,
    previewData,
  };
}

export function getEmptyReflectionStreamMock() {
  return [
    {
      request: {
        query: GetReflectionStreamDocument,
      },
      variableMatcher: () => true,
      result: {
        data: {
          node: {
            akashaReflectStreamList: {
              edges: [],
              pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
                __typename: 'PageInfo',
              },
              __typename: 'AkashaReflectStreamConnection',
            },
            isViewer: false,
            __typename: 'CeramicAccount',
          },
        },
      },
    },
  ];
}

export function getPendingReflectMock(authorProfileDID: string) {
  const profileData = genProfileByDID({ profileDID: authorProfileDID });
  return [
    {
      delay: 30,
      request: {
        query: GetProfileByDidDocument,
        variables: {
          id: authorProfileDID,
        },
      },
      result: {
        data: {
          node: profileData,
        },
      },
    },
  ];
}
