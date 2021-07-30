import * as React from 'react';
import { IAkashaError } from '@akashaproject/ui-awf-typings';
import { createErrorHandler } from './utils/error-handler';
import getSDK from '@akashaproject/awf-sdk';
import { getMediaUrl } from './utils/media-utils';

export interface UseMentionsActions {
  /**
   *  search for tags by user input query
   */
  getTags: (query: string) => void;
  /**
   *  search for mentions by user input query
   */
  getMentions: (query: string) => void;
}

export interface UseMentionsProps {
  onError?: (error: IAkashaError) => void;
}

export interface IMentionsState {
  tags: any[];
  mentions: any[];
  tagQuery: string | null;
  mentionQuery: string | null;
}

const initialMentionState = {
  tags: [],
  mentions: [],
  tagQuery: null,
  mentionQuery: null,
};

export type IMentionsAction =
  | { type: 'GET_TAGS'; payload: string }
  | {
      type: 'GET_TAGS_SUCCESS';
      payload: any[];
    }
  | { type: 'GET_MENTIONS'; payload: string }
  | {
      type: 'GET_MENTIONS_SUCCESS';
      payload: any[];
    };

const MentionStateReducer = (state: IMentionsState, action: IMentionsAction) => {
  switch (action.type) {
    case 'GET_TAGS':
      return { ...state, tagQuery: action.payload };
    case 'GET_TAGS_SUCCESS': {
      return {
        ...state,
        tagQuery: null,
        tags: action.payload,
      };
    }

    case 'GET_MENTIONS':
      return { ...state, mentionQuery: action.payload };
    case 'GET_MENTIONS_SUCCESS': {
      return {
        ...state,
        mentionQuery: null,
        mentions: action.payload,
      };
    }

    default:
      throw new Error('[UseMentionReducer] action is not defined!');
  }
};

/* A hook to query mentions and tags */
export const useMentions = (props: UseMentionsProps): [IMentionsState, UseMentionsActions] => {
  const { onError } = props;

  const sdk = getSDK();

  const [mentionsState, dispatch] = React.useReducer(MentionStateReducer, initialMentionState);

  React.useEffect(() => {
    if (mentionsState.tagQuery) {
      const tagsService = sdk.api.tags.searchTags(mentionsState.tagQuery);
      const tagsSub = tagsService.subscribe({
        next: resp => {
          dispatch({ type: 'GET_TAGS_SUCCESS', payload: resp.data.searchTags });
        },
        error: createErrorHandler('useMentions.getTags', false, onError),
      });
      return () => {
        tagsSub.unsubscribe();
      };
    }
    return;
  }, [mentionsState.tagQuery]);

  React.useEffect(() => {
    if (mentionsState.mentionQuery) {
      const mentionsService = sdk.api.profile.searchProfiles(mentionsState.mentionQuery);
      const mentionsSub = mentionsService.subscribe({
        next: resp => {
          const completeProfiles = resp.data.searchProfiles.map(profileResp => {
            const { avatar, coverImage, ...other } = profileResp;
            const images: { avatar: string | null; coverImage: string | null } = {
              avatar: null,
              coverImage: null,
            };
            if (avatar) {
              images.avatar = getMediaUrl(avatar);
            }
            if (coverImage) {
              images.coverImage = getMediaUrl(coverImage);
            }
            const profileData = { ...images, ...other };
            return profileData;
          });
          dispatch({ type: 'GET_MENTIONS_SUCCESS', payload: completeProfiles });
        },
        error: createErrorHandler('useMentions.getMentions', false, onError),
      });
      return () => {
        mentionsSub.unsubscribe();
      };
    }
    return;
  }, [mentionsState.mentionQuery]);

  const actions: UseMentionsActions = {
    getMentions(query) {
      dispatch({ type: 'GET_MENTIONS', payload: query });
    },
    getTags(query) {
      dispatch({ type: 'GET_TAGS', payload: query });
    },
  };

  return [mentionsState, actions];
};

export default useMentions;
