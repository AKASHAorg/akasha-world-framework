import { GetReflectionByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithId } from './selector-utils';

export const selectReflectionId = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.id;
  }
  return null;
};

export const selectReflectionActive = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.active;
  }
  return null;
};

export const selectReflectionAuthorId = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.author.id;
  }
  return null;
};

export const selectReflectionCreatedAt = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.createdAt;
  }
  return null;
};

export const selectReflectionNsfw = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.nsfw;
  }
  return null;
};

export const selectReflectionContent = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.content;
  }
  return null;
};

export const selectReflectionBeamId = (data: GetReflectionByIdQuery) => {
  if (isNodeWithId(data)) {
    return data.node.beam?.id;
  }
  return null;
};
