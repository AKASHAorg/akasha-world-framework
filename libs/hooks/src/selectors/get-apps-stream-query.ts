import { GetAppsStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { hasOwn } from '../utils/has-own';
import { isNodeObject } from './selector-utils';

export const selectAkashaAppStreamStatus = (data: GetAppsStreamQuery) => {
  if (
    data &&
    hasOwn(data, 'node') &&
    hasOwn(data.node, 'akashaAppsStreamList') &&
    isNodeObject(data.node.akashaAppsStreamList.edges[0]) &&
    hasOwn(data.node.akashaAppsStreamList.edges[0].node, 'status')
  )
    return data.node.akashaAppsStreamList.edges[0].node.status;
};
