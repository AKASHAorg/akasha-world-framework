import { GetAppsQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { isNodeWithId } from './selector-utils';
import { AkashaApp, AkashaAppEdge, PageInfo } from '@akashaorg/typings/lib/sdk/graphql-types-new';

const isAkashaAppEdgeNode = (
  data: GetAppsQuery,
): data is { akashaAppIndex: { edges: AkashaAppEdge[]; pageInfo: PageInfo } } => {
  return (
    data &&
    'akashaAppIndex' in data &&
    typeof data['akashaAppIndex'] === 'object' &&
    'edges' in data.akashaAppIndex &&
    Array.isArray(data.akashaAppIndex.edges)
  );
};

export const selectAkashaApp = (data: GetAppsQuery): AkashaApp => {
  if (isAkashaAppEdgeNode(data) && isNodeWithId(data.akashaAppIndex.edges[0])) {
    return data.akashaAppIndex.edges[0].node;
  }
};

const isNodeWithReleases = (data: AkashaApp) => {
  return (
    data.releases &&
    typeof data.releases === 'object' &&
    'edges' in data.releases &&
    Array.isArray(data.releases.edges)
  );
};
export const selectLatestRelease = (data: GetAppsQuery) => {
  if (
    isAkashaAppEdgeNode(data) &&
    isNodeWithId(data.akashaAppIndex.edges[0]) &&
    isNodeWithReleases(data.akashaAppIndex.edges[0].node)
  ) {
    const releases = data.akashaAppIndex.edges[0].node.releases.edges.slice().sort((a, b) => {
      return Date.parse(b.node.createdAt) - Date.parse(a.node.createdAt);
    });
    return releases[0];
  }
};

export const selectExtensionDescription = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.description;
};

export const selectExtensionLicense = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.license;
};

export const selectExtensionLogo = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.logoImage;
};

export const selectExtensionName = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.name;
};

export const selectExtensionDisplayName = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.displayName;
};

export const selectExtensionType = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.applicationType;
};

export const selectExtensionContributors = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.contributors;
};

export const selectAppId = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.id;
};

export const selectReleasesCount = (data: GetAppsQuery) => {
  return selectAkashaApp(data)?.releasesCount;
};
