export const FEED = 'Feed';
export const NEW_POST = 'New post';
export const POSTS = 'Posts';
export const POST = 'Post';
export const REPLY = 'Reply';
export const TAGS = 'Tags';
export const rootRoute = '/AKASHA-app';

export default {
  [FEED]: `${rootRoute}/feed`,
  [NEW_POST]: `${rootRoute}/new-post`,
  [POSTS]: `${rootRoute}/posts`,
  [POST]: `${rootRoute}/post`,
  [REPLY]: `${rootRoute}/reply`,
  [TAGS]: `${rootRoute}/tags`,
};
