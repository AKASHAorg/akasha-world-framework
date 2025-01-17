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

export const selectAppDescription = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.description;
  }
};

export const selectAppLogoImage = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.logoImage;
  }
};

export const selectAppId = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.id;
  }
};

export const selectAppData = (data: GetAppsByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node;
  }
};
