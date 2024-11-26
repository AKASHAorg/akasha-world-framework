import { GetAppsByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithId } from './selector-utils';

export const selectAppDisplayName = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.displayName;
  }
};

export const selectAppName = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.name;
  }
};

export const selectApplicationType = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.applicationType;
  }
};

export const selectAppId = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.id;
  }
};
