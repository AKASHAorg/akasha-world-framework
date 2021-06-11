import { IEntryData } from '@akashaproject/design-system/lib/components/EntryCard/entry-box';
import { IAkashaError } from '@akashaproject/ui-awf-typings';
import { IProfileData } from '@akashaproject/ui-awf-typings/lib/profile';
import * as React from 'react';
import { combineLatest } from 'rxjs';

import moderationRequest from './moderation-request';
import {
  buildPublishObject,
  createPendingEntry,
  excludeNonSlateContent,
  mapEntry,
} from './utils/entry-utils';
import { createErrorHandler } from './utils/error-handler';

export interface GetItemsPayload {
  start?: string;
  offset?: string | number;
  limit?: number;
}

export interface Status {
  delisted: boolean;
  moderated: boolean;
  reported: boolean;
}

export interface PublishPostData {
  metadata: {
    app: string;
    version: number;
    quote?: string;
    tags: string[];
    mentions: string[];
  };
  author: string;
  content: any;
  textContent: string;
}

export interface PostsActions {
  /**
   * request a single post by its id, checking its moderation status
   * and triggering getPostData to get the actual post data
   * @param postId - id of the post
   */
  getPost: (postId: string) => void;
  /**
   * internal method to get the actual post data after checking its moderation status
   * @param status - moderation status
   */
  getPostData: (status: Status, postId: string) => void;
  /**
   * request a single comment
   * @param commentId - id of the comment
   */
  getComment: (commentId: string) => void;
  /**
   * request multiple posts
   * @param payload - can have start, limit and offset
   */
  getPosts: (payload: GetItemsPayload) => void;
  /**
   * request multiple comments
   * @param payload - can have start, limit and offset
   */
  getComments: (payload: GetItemsPayload) => void;
  /**
   * request multiple posts from a user
   * @param payload - must have pubKey of the user ,optional limit and offset
   */
  getUserPosts: (payload: { pubKey: string; limit: number; offset?: string }) => void;
  /**
   * request multiple posts related to a tag
   * @param payload - must have name of the tag, optional limit and offset
   */
  getTagPosts: (payload: { name: string; limit: number; offset?: string }) => void;
  /**
   * publish a comment
   */
  optimisticPublishComment: (
    commentData: PublishPostData,
    postId: string,
    loggedProfile: IProfileData,
  ) => void;
  /**
   * publish a post
   */
  optimisticPublishPost: (
    postData: PublishPostData,
    loggedProfile: IProfileData,
    currentEmbedEntry: any,
    disablePendingFeedback?: boolean,
  ) => void;
  /* reset post ids (basically reset the list) */
  resetPostIds: () => void;
  updatePostsState: (updatedEntry: any) => void;
}

export interface UsePostsProps {
  user: string | null;
  postsService: any;
  ipfsService: any;
  onError: (error: IAkashaError) => void;
  logger?: unknown;
}

export interface PostsState {
  /* post ids for feed */
  postIds: string[];
  /* comment ids */
  commentIds: string[];
  /* posts/comments data */
  postsData: { [key: string]: any };
  /* next index of posts */
  nextPostIndex: string | number | null;
  /* next index of comments */
  nextCommentIndex: string | number | null;
  isFetchingPosts: boolean;
  fetchingPosts: string[];
  isFetchingComments: boolean;
  fetchingComments: string[];
  /* pending publish posts */
  pendingPosts: any[];
  /* pending publish comments */
  pendingComments: any[];
  totalItems: number | null;
  delistedItems: string[];
  reportedItems: string[];
  // reducer related
  getCommentQuery: string | null;
  getCommentsQuery: GetItemsPayload | null;
  getPostDataQuery: { status: Status; postId: string } | null;
  getPostsQuery: GetItemsPayload | null;
  optimisticPublishCommentQuery: { pendingId: string; pending: any; publishObj: any } | null;
  optimisticPublishPostQuery: { pendingId: string; pending: any; publishObj: any } | null;
  getUserPostsQuery: any | null;
  getTagPostsQuery: any | null;
}

const initialPostsState: PostsState = {
  postIds: [],
  commentIds: [],
  postsData: {},
  nextPostIndex: null,
  nextCommentIndex: '',
  isFetchingPosts: false,
  isFetchingComments: false,
  fetchingPosts: [],
  fetchingComments: [],
  pendingPosts: [],
  pendingComments: [],
  totalItems: null,
  delistedItems: [],
  reportedItems: [],
  //reducer related
  getCommentQuery: null,
  getCommentsQuery: null,
  getPostDataQuery: null,
  getPostsQuery: null,
  optimisticPublishCommentQuery: null,
  optimisticPublishPostQuery: null,
  getUserPostsQuery: null,
  getTagPostsQuery: null,
};

export type IPostsAction =
  | { type: 'ADD_DELISTED_ITEM'; payload: string }
  | { type: 'ADD_REPORTED_ITEM'; payload: string }
  | { type: 'GET_POST_DATA'; payload: { status: Status; postId: string } }
  | { type: 'GET_POST_DATA_SUCCESS'; payload: { entry: any; postId: string } }
  | { type: 'GET_POSTS'; payload: GetItemsPayload }
  | {
      type: 'GET_POSTS_SUCCESS';
      payload: { nextIndex: string | number; posts: any; newIds: string[]; total: number };
    }
  | { type: 'RESET_POST_IDS' }
  | { type: 'GET_COMMENT'; payload: string }
  | { type: 'GET_COMMENT_SUCCESS'; payload: { comment: any; commentId: string } }
  | { type: 'GET_COMMENTS'; payload: GetItemsPayload }
  | {
      type: 'GET_COMMENTS_SUCCESS';
      payload: { nextIndex: string | number; comments: any; newIds: string[]; total: number };
    }
  | {
      type: 'OPTIMISTIC_PUBLISH_COMMENT';
      payload: { pendingId: string; pending: any; publishObj: any };
    }
  | { type: 'OPTIMISTIC_PUBLISH_COMMENT_SUCCESS'; payload: { commentId: string; pending: any } }
  | { type: 'OPTIMISTIC_PUBLISH_COMMENT_ERROR'; payload: string }
  | {
      type: 'OPTIMISTIC_PUBLISH_POST';
      payload: { pendingId: string; pending: any; publishObj: any };
    }
  | {
      type: 'OPTIMISTIC_PUBLISH_POST_SUCCESS';
      payload: { publishedEntryId: string; entryData: IEntryData; pendingId: string };
    }
  | { type: 'OPTIMISTIC_PUBLISH_POST_ERROR'; payload: string }
  | {
      type: 'GET_USER_POSTS';
      payload: {
        pubKey: string;
        limit: number;
        offset?: string | undefined;
      };
    }
  | {
      type: 'GET_USER_POSTS_SUCCESS';
      payload: { nextIndex: string | number; posts: any; newIds: string[]; total: number };
    }
  | {
      type: 'GET_TAG_POSTS';
      payload: {
        name: string;
        limit: number;
        offset?: string | undefined;
      };
    }
  | {
      type: 'GET_TAG_POSTS_SUCCESS';
      payload: { nextIndex: string | number; posts: any; newIds: string[]; total: number };
    }
  | { type: 'UPDATE_POSTS_STATE'; payload: any };

const postsStateReducer = (state: PostsState, action: IPostsAction) => {
  switch (action.type) {
    case 'ADD_DELISTED_ITEM':
      return {
        ...state,
        delistedItems: !state.delistedItems.includes(action.payload)
          ? state.delistedItems.concat(action.payload)
          : state.delistedItems,
      };
    case 'ADD_REPORTED_ITEM':
      return {
        ...state,
        reportedItems: !state.reportedItems.includes(action.payload)
          ? state.reportedItems.concat(action.payload)
          : state.reportedItems,
      };

    case 'GET_POST_DATA':
      return {
        ...state,
        fetchingPosts: state.fetchingPosts.concat([action.payload.postId]),
        getPostDataQuery: action.payload,
      };

    case 'GET_POST_DATA_SUCCESS':
      return {
        ...state,
        getPostDataQuery: null,
        postsData: { ...state.postsData, [action.payload.entry.entryId]: action.payload.entry },
        fetchingPosts: state.fetchingPosts.filter(id => id !== action.payload.postId),
      };

    case 'RESET_POST_IDS':
      return {
        ...state,
        postIds: [],
        commentIds: [],
        fetchingPosts: [],
        fetchingComments: [],
        pendingPosts: [],
        pendingComments: [],
        nextPostIndex: null,
        nextCommentIndex: null,
        totalItems: null,
      };

    case 'GET_COMMENT':
      return {
        ...state,
        fetchingComments: state.fetchingComments.concat([action.payload]),
        getCommentQuery: action.payload,
      };

    case 'GET_COMMENT_SUCCESS':
      return {
        ...state,
        getCommentQuery: null,
        postsData: { ...state.postsData, [action.payload.comment.entryId]: action.payload.comment },
        fetchingComments: state.fetchingComments.filter(id => id !== action.payload.commentId),
      };

    case 'GET_COMMENTS':
      return {
        ...state,
        isFetchingComments: true,
        getCommentsQuery: action.payload,
      };

    case 'GET_COMMENTS_SUCCESS': {
      const { nextIndex, comments, newIds, total } = action.payload;
      return {
        ...state,
        getCommentsQuery: null,
        nextCommentIndex: nextIndex,
        postsData: { ...state.postsData, ...comments },
        commentIds: state.commentIds.concat(newIds),
        isFetchingComments: false,
        totalItems: total,
      };
    }

    case 'GET_POSTS':
      return {
        ...state,
        isFetchingPosts: true,
        getPostsQuery: action.payload,
      };

    case 'GET_POSTS_SUCCESS': {
      const { nextIndex, posts, newIds, total } = action.payload;
      return {
        ...state,
        getPostsQuery: null,
        nextPostIndex: nextIndex,
        postsData: { ...state.postsData, ...posts },
        postIds: state.postIds.concat(newIds),
        isFetchingPosts: false,
        totalItems: total,
      };
    }

    case 'OPTIMISTIC_PUBLISH_COMMENT':
      return {
        ...state,
        pendingComments: [
          { pendingId: action.payload.pendingId, ...action.payload.pending },
          ...state.pendingComments,
        ],
        optimisticPublishCommentQuery: action.payload,
      };

    case 'OPTIMISTIC_PUBLISH_COMMENT_ERROR': {
      const pendingComments = state.pendingComments.slice();
      const erroredIdx = pendingComments.findIndex(p => p.pendingId === action.payload);
      pendingComments.splice(erroredIdx, 1, {
        ...pendingComments[erroredIdx],
        error: 'There was an error publishing this comment!',
      });

      return {
        ...state,
        optimisticPublishCommentQuery: null,
        pendingComments,
      };
    }

    case 'OPTIMISTIC_PUBLISH_COMMENT_SUCCESS': {
      const { commentId, pending } = action.payload;
      return {
        ...state,
        optimisticPublishCommentQuery: null,
        pendingComments: [],
        postsData: { ...state.postsData, [commentId]: pending },
        commentIds: [commentId, ...state.commentIds],
      };
    }

    case 'OPTIMISTIC_PUBLISH_POST':
      return {
        ...state,
        pendingPosts: [
          { pendingId: action.payload.pendingId, ...action.payload.pending },
          ...state.pendingPosts,
        ],
        optimisticPublishPostQuery: action.payload,
      };

    case 'OPTIMISTIC_PUBLISH_POST_ERROR': {
      const pendingPosts = state.pendingPosts.slice();
      const erroredIdx = pendingPosts.findIndex(p => p.pendingId === action.payload);
      pendingPosts.splice(erroredIdx, 1, {
        ...pendingPosts[erroredIdx],
        error: 'There was an error publishing this post!',
      });

      return {
        ...state,
        optimisticPublishPostQuery: null,
        pendingPosts,
      };
    }

    case 'OPTIMISTIC_PUBLISH_POST_SUCCESS': {
      const { publishedEntryId, entryData, pendingId } = action.payload;
      return {
        ...state,
        optimisticPublishPostQuery: null,
        postsData: {
          ...state.postsData,
          [publishedEntryId]: { ...entryData, entryId: publishedEntryId },
        },
        pendingPosts: state.pendingPosts.filter(post => post.pendingId !== pendingId),
        postIds: [publishedEntryId, ...state.postIds],
      };
    }

    case 'GET_USER_POSTS':
      return {
        ...state,
        isFetchingPosts: true,
        getUserPostsQuery: action.payload,
      };

    case 'GET_USER_POSTS_SUCCESS': {
      const { nextIndex, posts, newIds, total } = action.payload;
      return {
        ...state,
        getUserPostsQuery: null,
        nextPostIndex: nextIndex,
        postsData: { ...state.postsData, ...posts },
        postIds: state.postIds.concat(newIds),
        isFetchingPosts: false,
        totalItems: total,
      };
    }

    case 'GET_TAG_POSTS':
      return {
        ...state,
        isFetchingPosts: true,
        getTagPostsQuery: action.payload,
      };

    case 'GET_TAG_POSTS_SUCCESS': {
      const { nextIndex, posts, newIds, total } = action.payload;
      return {
        ...state,
        getTagPostsQuery: null,
        nextPostIndex: nextIndex,
        postsData: { ...state.postsData, ...posts },
        postIds: state.postIds.concat(newIds),
        isFetchingPosts: false,
        totalItems: total,
      };
    }

    case 'UPDATE_POSTS_STATE': {
      const { updatedEntry } = action.payload;
      const index = state.reportedItems.indexOf(updatedEntry.entryId);
      if (index > -1) {
        state.reportedItems.splice(index, 1);
      }
      return {
        ...state,
        postsData: { ...state.postsData, [updatedEntry.entryId]: updatedEntry },
        reportedItems: state.reportedItems,
      };
    }

    default:
      throw new Error('[UsePostsReducer] action is not defined!');
  }
};

export interface GetEntriesResponse {
  channelInfo: any;
  data: { posts: { nextIndex: number; results: any[]; total: number } };
}

// tslint:disable:cyclomatic-complexity
/* eslint-disable complexity */
const usePosts = (props: UsePostsProps): [PostsState, PostsActions] => {
  const { user, postsService, ipfsService, logger, onError } = props;
  const [postsState, dispatch] = React.useReducer(postsStateReducer, initialPostsState);

  React.useEffect(() => {
    if (postsState.isFetchingComments && postsState.getCommentsQuery) {
      const commentsCall = postsService.comments.getComments(postsState.getCommentsQuery);
      const ipfsSettingsCall = ipfsService.getSettings(null);
      const calls = combineLatest([ipfsSettingsCall, commentsCall]);
      const sub = calls.subscribe({
        next: (responses: any[]) => {
          const [ipfsResp, commentsResp] = responses;
          const { data } = commentsResp;
          const {
            nextIndex,
            results,
            total,
          }: GetEntriesResponse['data']['posts'] = data.getComments;
          const newIds: string[] = [];
          const comments = results
            .filter(excludeNonSlateContent)
            .map(entry => {
              newIds.push(entry._id);
              return mapEntry(entry, ipfsResp.data);
            })
            .reduce((obj, post) => ({ ...obj, [post.entryId]: post }), {});

          dispatch({
            type: 'GET_COMMENTS_SUCCESS',
            payload: { nextIndex, comments, newIds, total },
          });
        },
        error: createErrorHandler('usePosts.getComments', false, onError),
      });
      return () => sub && sub.unsubscribe();
    }
    return;
  }, [postsState.isFetchingComments, postsState.getCommentsQuery]);

  React.useEffect(() => {
    if (postsState.getPostDataQuery) {
      const status = postsState.getPostDataQuery.status;
      const postId = postsState.getPostDataQuery.postId;
      const entryCall = postsService.entries.getEntry({
        entryId: postId,
      });
      const ipfsGatewayCall = ipfsService.getSettings(null);
      const getEntryCall = combineLatest([ipfsGatewayCall, entryCall]);

      const sub = getEntryCall.subscribe({
        next: async (responses: any[]) => {
          const [ipfsResp, entryResp] = responses;
          const ipfsGateway = ipfsResp.data;
          const entry = entryResp.data?.getPost;
          if (entry) {
            const mappedEntry = mapEntry(
              {
                ...entry,
                reported: status.moderated ? false : status.reported,
                delisted: status.delisted,
              },
              ipfsGateway,
              logger,
            );

            const quotestatus =
              mappedEntry.quote &&
              (await moderationRequest.checkStatus(true, {
                user,
                contentIds: [mappedEntry.quote.entryId],
              }));

            if (quotestatus && quotestatus.constructor === Array) {
              const modifiedEntry = {
                ...mappedEntry,
                reported: status.reported,
                delisted: status.delisted,
                quote: mappedEntry.quote
                  ? {
                      ...mappedEntry.quote,
                      // if moderated, bypass value of reported for the user
                      reported: quotestatus[0].moderated ? false : quotestatus[0].reported,
                      delisted: quotestatus[0].delisted,
                    }
                  : mappedEntry.quote,
              };
              dispatch({
                type: 'GET_POST_DATA_SUCCESS',
                payload: { entry: modifiedEntry, postId },
              });
            } else {
              dispatch({ type: 'GET_POST_DATA_SUCCESS', payload: { entry: mappedEntry, postId } });
            }
          }
        },
        error: createErrorHandler('usePosts.getPost', false, onError),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.getPostDataQuery]);

  React.useEffect(() => {
    if (postsState.getCommentQuery) {
      const commentId = postsState.getCommentQuery;
      const commentCall = postsService.comments.getComment({ commentID: commentId });
      const ipfsGatewayCall = ipfsService.getSettings(null);
      const calls = combineLatest([ipfsGatewayCall, commentCall]);

      calls.subscribe({
        next: (responses: any[]) => {
          const [ipfsResp, commentResp] = responses;
          const comment = commentResp.data?.getComment;
          if (comment) {
            const mappedComment = mapEntry(comment, ipfsResp.data, logger);
            dispatch({
              type: 'GET_COMMENT_SUCCESS',
              payload: { comment: mappedComment, commentId },
            });
          }
        },
        error: createErrorHandler('usePosts.getComment', false, onError),
      });
    }
    return;
  }, [postsState.getCommentQuery]);

  React.useEffect(() => {
    if (postsState.getPostsQuery) {
      const payload = postsState.getPostsQuery;
      const entriesCall = postsService.entries.getEntries({
        ...payload,
        offset: payload.offset || postsState.nextPostIndex,
      });

      const ipfsSettingsCall = ipfsService.getSettings({});
      const calls = combineLatest([ipfsSettingsCall, entriesCall]);
      const sub = calls.subscribe({
        next: async (responses: any[]) => {
          const [ipfsResp, entriesResp] = responses;
          const ipfsGateway = ipfsResp.data;
          const { data }: GetEntriesResponse = entriesResp;

          const { nextIndex, results, total } = data.posts;
          const newIds: string[] = [];
          const newQuoteIds: string[] = [];
          const posts = results
            .filter(excludeNonSlateContent)
            .map(entry => {
              newIds.push(entry._id);
              // check if entry has quote and id of such quote is not yet in the list
              if (entry.quotes?.length > 0 && newQuoteIds.indexOf(entry.quotes[0]._id) === -1) {
                newQuoteIds.push(entry.quotes[0]._id);
              }
              return mapEntry(entry, ipfsGateway, logger);
            })
            .reduce((obj, post) => ({ ...obj, [post.entryId]: post }), {});
          try {
            const status = await moderationRequest.checkStatus(true, { user, contentIds: newIds });
            const quotestatus =
              !!newQuoteIds.length &&
              (await moderationRequest.checkStatus(true, { user, contentIds: newQuoteIds }));
            if (status && status.constructor === Array) {
              status.forEach((res: any) => {
                const target = posts[res.contentId];
                let quote: any;

                if (target.quote) {
                  const { reported, delisted, moderated } = quotestatus.find(
                    (el: any) => el.contentId === target.quote.entryId,
                  );
                  quote = {
                    ...target.quote,
                    // if moderated, bypass value of reported for the user
                    reported: moderated ? false : reported,
                    delisted: delisted,
                  };
                }

                if (res.delisted) {
                  const index = newIds.indexOf(res.contentId);
                  if (index > -1) {
                    // remove the entry id from newIds
                    newIds.splice(index, 1);
                  }
                  // remove the entry from posts object
                  delete posts[res.contentId];
                } else {
                  // update entry in posts object
                  posts[res.contentId] = {
                    ...target,
                    delisted: res.delisted,
                    // if moderated, bypass value of reported for the user
                    reported: res.moderated ? false : res.reported,
                    quote: quote,
                  };
                }
              });
            }
            dispatch({ type: 'GET_POSTS_SUCCESS', payload: { nextIndex, posts, newIds, total } });
          } catch (err) {
            newIds.forEach(id => {
              createErrorHandler(
                `${id}`,
                false,
                onError,
              )(new Error(`Failed to fetch moderated content. ${err.message}`));
            });
          }
        },
        error: createErrorHandler('usePosts.getPosts', false, onError),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.getPostsQuery]);

  React.useEffect(() => {
    if (postsState.optimisticPublishCommentQuery) {
      const { pendingId, pending, publishObj } = postsState.optimisticPublishCommentQuery;
      const publishCall = postsService.comments.addComment(publishObj);
      const sub = publishCall.subscribe({
        next: (resp: any) => {
          const commentId = resp.data?.addComment;
          if (!commentId) {
            return dispatch({ type: 'OPTIMISTIC_PUBLISH_COMMENT_ERROR', payload: pendingId });
          }
          dispatch({ type: 'OPTIMISTIC_PUBLISH_COMMENT_SUCCESS', payload: { commentId, pending } });
        },
        error: createErrorHandler('usePosts.optimisticPublishComment'),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.optimisticPublishCommentQuery]);

  React.useEffect(() => {
    if (postsState.optimisticPublishPostQuery) {
      const { pendingId, pending, publishObj } = postsState.optimisticPublishPostQuery;

      const postEntryCall = postsService.entries.postEntry(publishObj);
      const sub = postEntryCall.subscribe({
        next: (postingResp: any) => {
          if (!postingResp.data?.createPost) {
            return dispatch({ type: 'OPTIMISTIC_PUBLISH_POST_ERROR', payload: pendingId });
          }
          const publishedEntryId = postingResp.data.createPost;

          const entryData = pending as IEntryData;
          dispatch({
            type: 'OPTIMISTIC_PUBLISH_POST_SUCCESS',
            payload: { publishedEntryId, entryData, pendingId },
          });
        },
        error: createErrorHandler('usePosts.optimisticPublishPost', false, onError),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.optimisticPublishPostQuery]);

  React.useEffect(() => {
    if (postsState.getUserPostsQuery) {
      const payload = postsState.getUserPostsQuery;
      const req: any = {
        ...payload,
      };
      if (typeof postsState.nextPostIndex === 'number') {
        req.offset = postsState.nextPostIndex;
      }
      const userPostsCall = postsService.entries.entriesByAuthor(req);
      const ipfsGatewayCall = ipfsService.getSettings({});

      const sub = combineLatest([ipfsGatewayCall, userPostsCall]).subscribe({
        next: async (responses: any[]) => {
          const [ipfsGatewayResp, userPostsResp] = responses;
          const {
            results,
            nextIndex,
            total,
          }: {
            results: any[];
            nextIndex: number;
            total: number;
          } = userPostsResp.data.getPostsByAuthor;
          const newIds: string[] = [];
          const newQuoteIds: string[] = [];
          const posts = results
            .filter(excludeNonSlateContent)
            .map(entry => {
              newIds.push(entry._id);
              // check if entry has quote and id of such quote is not yet in the list
              if (entry.quotes?.length > 0 && newQuoteIds.indexOf(entry.quotes[0]._id) === -1) {
                newQuoteIds.push(entry.quotes[0]._id);
              }
              return mapEntry(entry, ipfsGatewayResp.data, logger);
            })
            .reduce((obj, post) => ({ ...obj, [post.entryId]: post }), {});

          try {
            const status = await moderationRequest.checkStatus(true, { user, contentIds: newIds });
            const quotestatus =
              !!newQuoteIds.length &&
              (await moderationRequest.checkStatus(true, { user, contentIds: newQuoteIds }));
            if (status && status.constructor === Array) {
              status.forEach((res: any) => {
                const target = posts[res.contentId];
                let quote: any;

                if (target.quote) {
                  const { reported, delisted, moderated } = quotestatus.find(
                    (el: any) => el.contentId === target.quote.entryId,
                  );
                  quote = {
                    ...target.quote,
                    // if moderated, bypass value of reported for the user
                    reported: moderated ? false : reported,
                    delisted: delisted,
                  };
                }

                if (res.delisted) {
                  const index = newIds.indexOf(res.contentId);
                  if (index > -1) {
                    // remove the entry id from newIds
                    newIds.splice(index, 1);
                  }
                  // remove the entry from posts object
                  delete posts[res.contentId];
                } else {
                  // update entry in posts object
                  posts[res.contentId] = {
                    ...target,
                    delisted: res.delisted,
                    // if moderated, bypass value of reported for the user
                    reported: res.moderated ? false : res.reported,
                    quote: quote,
                  };
                }
              });
            }
            dispatch({
              type: 'GET_USER_POSTS_SUCCESS',
              payload: { nextIndex, posts, newIds, total },
            });
          } catch (err) {
            newIds.forEach(id => {
              createErrorHandler(
                `${id}`,
                false,
                onError,
              )(new Error(`Failed to fetch moderated content. ${err.message}`));
            });
          }
        },
        error: createErrorHandler('usePosts.getUserPosts', false, onError),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.getUserPostsQuery]);

  React.useEffect(() => {
    if (postsState.getTagPostsQuery) {
      const payload = postsState.getTagPostsQuery;
      const req: any = {
        ...payload,
      };
      if (typeof postsState.nextPostIndex === 'number') {
        req.offset = postsState.nextPostIndex;
      }
      const tagPostsCall = postsService.entries.entriesByTag(req);
      const ipfsGatewayCall = ipfsService.getSettings(null);

      const sub = combineLatest([ipfsGatewayCall, tagPostsCall]).subscribe({
        next: async (responses: any[]) => {
          const [ipfsGatewayResp, tagPostsResp] = responses;
          const {
            results,
            nextIndex,
            total,
          }: {
            results: any[];
            nextIndex: number;
            total: number;
          } = tagPostsResp.data.getPostsByTag;
          const newIds: string[] = [];
          const newQuoteIds: string[] = [];
          const posts = results
            .filter(excludeNonSlateContent)
            .map(entry => {
              newIds.push(entry._id);
              // check if entry has quote and id of such quote is not yet in the list
              if (entry.quotes?.length > 0 && newQuoteIds.indexOf(entry.quotes[0]._id) === -1) {
                newQuoteIds.push(entry.quotes[0]._id);
              }
              return mapEntry(entry, ipfsGatewayResp.data, logger);
            })
            .reduce((obj, post) => ({ ...obj, [post.entryId]: post }), {});

          try {
            const status = await moderationRequest.checkStatus(true, { user, contentIds: newIds });
            const quotestatus =
              !!newQuoteIds.length &&
              (await moderationRequest.checkStatus(true, { user, contentIds: newQuoteIds }));
            if (status && status.constructor === Array) {
              status.forEach((res: any) => {
                const target = posts[res.contentId];
                let quote: any;

                if (target.quote) {
                  const { reported, delisted, moderated } = quotestatus.find(
                    (el: any) => el.contentId === target.quote.entryId,
                  );
                  quote = {
                    ...target.quote,
                    // if moderated, bypass value of reported for the user
                    reported: moderated ? false : reported,
                    delisted: delisted,
                  };
                }

                if (res.delisted) {
                  const index = newIds.indexOf(res.contentId);
                  if (index > -1) {
                    // remove the entry id from newIds
                    newIds.splice(index, 1);
                  }
                  // remove the entry from posts object
                  delete posts[res.contentId];
                } else {
                  // update entry in posts object
                  posts[res.contentId] = {
                    ...target,
                    delisted: res.delisted,
                    // if moderated, bypass value of reported for the user
                    reported: res.moderated ? false : res.reported,
                    quote: quote,
                  };
                }
              });
            }
            dispatch({
              type: 'GET_TAG_POSTS_SUCCESS',
              payload: { nextIndex, posts, newIds, total },
            });
          } catch (err) {
            newIds.forEach(id => {
              createErrorHandler(
                `${id}`,
                false,
                onError,
              )(new Error(`Failed to fetch moderated content. ${err.message}`));
            });
          }
        },
        error: createErrorHandler('usePosts.getTagPosts', false, onError),
      });
      return () => sub.unsubscribe();
    }
    return;
  }, [postsState.getTagPostsQuery]);

  const actions: PostsActions = {
    getPost: async postId => {
      // check moderation status of post
      const [status] = await moderationRequest.checkStatus(true, { user, contentIds: [postId] });
      // if post is delisted,
      if (status.delisted) {
        // short circuit other requests
        dispatch({ type: 'ADD_DELISTED_ITEM', payload: postId });
        // if post is reported and not yet moderated
      } else if (status.reported && !status.moderated) {
        // update state,
        dispatch({ type: 'ADD_REPORTED_ITEM', payload: postId });
        // then continue to fetch post
        actions.getPostData(status, postId);
      } else {
        actions.getPostData(status, postId);
      }
    },
    getPostData: (status: Status, postId) => {
      dispatch({ type: 'GET_POST_DATA', payload: { status, postId } });
    },
    resetPostIds: () => {
      dispatch({ type: 'RESET_POST_IDS' });
    },
    getComment: commentId => {
      dispatch({ type: 'GET_COMMENT', payload: commentId });
    },
    getPosts: payload => {
      dispatch({ type: 'GET_POSTS', payload });
    },
    getComments: payload => {
      if (postsState.commentIds.length === postsState.totalItems || postsState.isFetchingComments) {
        return;
      }
      const { offset = postsState.nextCommentIndex, ...other } = payload;

      const params: GetItemsPayload = { ...other };
      if (offset) {
        params.offset = offset;
      }
      dispatch({ type: 'GET_COMMENTS', payload: params });
    },
    optimisticPublishComment: (commentData, postId, loggedProfile) => {
      const publishObj = buildPublishObject(commentData, postId);
      const pendingId = `${loggedProfile.ethAddress}-${postsState.pendingPosts.length}`;
      const pending = createPendingEntry(
        {
          ethAddress: loggedProfile.ethAddress as string,
          pubKey: loggedProfile.pubKey,
          avatar: loggedProfile.avatar,
          userName: loggedProfile.userName,
          name: loggedProfile.name,
          coverImage: loggedProfile.coverImage,
          description: loggedProfile.description,
        },
        commentData,
      );
      dispatch({ type: 'OPTIMISTIC_PUBLISH_COMMENT', payload: { pendingId, pending, publishObj } });
    },
    optimisticPublishPost: (postData, loggedProfile, currentEmbedEntry, disablePendingFeedback) => {
      const publishObj = buildPublishObject(postData);
      const pendingId = `${loggedProfile.ethAddress}-${postsState.pendingPosts.length}`;
      let pending: any;
      if (!disablePendingFeedback) {
        pending = createPendingEntry(
          {
            ethAddress: loggedProfile.ethAddress as string,
            pubKey: loggedProfile.pubKey,
            avatar: loggedProfile.avatar,
            name: loggedProfile.name,
            userName: loggedProfile.userName,
            ensName: loggedProfile.ensName,
            coverImage: loggedProfile.coverImage,
            description: loggedProfile.description,
          },
          postData,
          currentEmbedEntry,
        );

        dispatch({
          type: 'OPTIMISTIC_PUBLISH_POST',
          payload: { pendingId, pending, publishObj },
        });
      }
    },
    getUserPosts: payload => {
      dispatch({ type: 'GET_USER_POSTS', payload });
    },
    getTagPosts: payload => {
      dispatch({ type: 'GET_TAG_POSTS', payload });
    },
    updatePostsState: (updatedEntry: any) => {
      dispatch({ type: 'UPDATE_POSTS_STATE', payload: updatedEntry });
    },
  };
  return [postsState, actions];
};
// tslint:disable:cyclomatic-complexity
/* eslint-disable complexity */
export default usePosts;
