import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { lastValueFrom } from 'rxjs';
import getSDK from '@akashaproject/awf-sdk';
import { mapEntry } from './utils/entry-utils';
import { DataProviderInput } from '@akashaproject/sdk-typings/lib/interfaces/common';

// these can be used with useQueryClient() to fetch data
export const COMMENT_KEY = 'Comment';
export const COMMENTS_KEY = 'Comments';

const getComments = async (limit: number, postID: string, offset?: string) => {
  const sdk = getSDK();
  const res = await lastValueFrom(
    sdk.api.comments.getComments({
      limit: limit,
      offset: offset,
      postID: postID,
    }),
  );
  // @Todo: Remap this?
  return res.data.getComments;
};

// hook for fetching feed data
export function useInfiniteComments(limit: number, postID: string, offset?: string) {
  return useInfiniteQuery(
    [COMMENTS_KEY, postID],
    async ({ pageParam = offset }) => getComments(limit, postID, pageParam),
    {
      getNextPageParam: (lastPage, allPages) => lastPage.nextIndex,
      //getPreviousPageParam: (lastPage, allPages) => lastPage.posts.results[0]._id,
      enabled: !!(offset || limit),
      keepPreviousData: true,
    },
  );
}

const getComment = async commentID => {
  const sdk = getSDK();
  const ipfsGateway = sdk.services.common.ipfs.getSettings().gateway;
  const res = await lastValueFrom(sdk.api.comments.getComment(commentID));
  // remap the object props here
  return mapEntry(res.data.getComment, ipfsGateway);
};

// hook for fetching data for a specific commentID/entryID
export function useComment(commentID: string) {
  return useQuery([COMMENT_KEY, commentID], () => getComment(commentID), {
    enabled: !!commentID,
    keepPreviousData: true,
  });
}

export interface Publish_Options {
  data: DataProviderInput[];
  comment: { title?: string; tags?: string[]; postID: string };
}
/**
 * Example:
 * ```
 * const delPost = useDeletePost();
 * delPost.mutate("myEntryId");
 * ```
 */
export function useDeletePost(commentID: string) {
  const sdk = getSDK();
  const queryClient = useQueryClient();
  return useMutation(commentID => lastValueFrom(sdk.api.entries.removeEntry(commentID)), {
    // When mutate is called:
    onMutate: async (commentID: string) => {
      await queryClient.cancelQueries(COMMENT_KEY);

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData([COMMENT_KEY, commentID]);
      // can add some optimistic updates here
      // ex: queryClient.setQueryData([COMMENT_KEY, commentID], {})

      return { previousPost };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData([COMMENT_KEY, commentID], context.previousPost);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries([COMMENT_KEY, commentID]);
      await queryClient.invalidateQueries(COMMENTS_KEY);
    },
  });
}

export function useCreateComment() {
  const sdk = getSDK();
  const queryClient = useQueryClient();

  const pendingID = 'pending' + new Date().getTime();
  return useMutation(
    async (publishObj: Publish_Options) => {
      const res = await lastValueFrom(sdk.api.comments.addComment(publishObj));
      return res?.data?.addComment;
    },
    {
      onMutate: async (publishObj: {
        data: DataProviderInput[];
        comment: { title?: string; tags?: string[]; quotes?: string[] };
      }) => {
        const optimisticComment = Object.assign({}, publishObj, { isPublishing: true });
        queryClient.setQueryData([COMMENT_KEY, pendingID], optimisticComment);

        return { optimisticComment };
      },
      onError: (err, variables, context) => {
        if (context?.optimisticComment) {
          queryClient.setQueryData(
            [COMMENT_KEY, pendingID],
            Object.assign({}, context.optimisticComment, { hasErrored: true }),
          );
        }
      },
      onSuccess: async id => {
        await queryClient.fetchQuery([COMMENT_KEY, id], () => getComment(id));
      },
      onSettled: async () => {
        await queryClient.invalidateQueries([COMMENT_KEY, pendingID]);
        await queryClient.invalidateQueries(COMMENTS_KEY);
      },
    },
  );
}
