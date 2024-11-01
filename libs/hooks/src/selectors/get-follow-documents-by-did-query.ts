import { GetFollowDocumentsByDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithIsViewer } from './selector-utils';

export const selectFollowDocuments = (data: GetFollowDocumentsByDidQuery) => {
  if (isNodeWithIsViewer(data)) {
    return data.node.akashaFollowList?.edges || [];
  }
};
