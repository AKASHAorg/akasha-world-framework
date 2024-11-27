import { GetAppsByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithId } from './selector-utils';

export const selectAppDisplayName = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.displayName;
  }
};

export const selectAppData = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node;
  }
};
