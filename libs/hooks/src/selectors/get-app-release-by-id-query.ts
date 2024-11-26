import { GetAppReleaseByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithId } from './selector-utils';

export const selectApp = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application;
  }
};

export const selectAppName = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application.name;
  }
};

export const selectAppDisplayName = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application.displayName;
  }
};

export const selectAppDescription = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application.description;
  }
};

export const selectAppType = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application.applicationType;
  }
};

export const selectAppLogoImage = (data: GetAppReleaseByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.application.logoImage;
  }
};
