import { GetAppsStreamQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { hasOwn } from '../utils/has-own';
import { isNodeObject } from './selector-utils';

const isAkashaAppStreamEdgeNode = (data: GetAppsStreamQuery) => {
  return (
    data &&
    'node' in data &&
    'akashaAppStreamList' in data.node &&
    typeof data.node['akashaAppStreamList'] === 'object' &&
    'edges' in data.node.akashaAppStreamList &&
    Array.isArray(data.node.akashaAppStreamList.edges)
  );
};

export const selectAkashaAppStreamStatus = (data: GetAppsStreamQuery) => {
  if (
    isAkashaAppStreamEdgeNode(data) &&
    hasOwn(data.node, 'akashaAppsStreamList') &&
    isNodeObject(data.node.akashaAppsStreamList.edges[0]) &&
    hasOwn(data.node.akashaAppsStreamList.edges[0].node, 'status')
  )
    return data.node.akashaAppsStreamList.edges[0].node.status;
};
