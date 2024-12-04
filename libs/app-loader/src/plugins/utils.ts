import { ExtensionActivityFn } from '@akashaorg/typings/lib/ui';
import { pathToActiveWhen } from 'single-spa';
import { DeepTarget } from '../type-utils';
import { GetAppsByPublisherDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

export const stringToRegExp = (str: string) => {
  const wildcard = str.split(/\*+/).map(escapeRegExp).join('.*');
  return new RegExp(`^${wildcard}$`);
};

export const checkActivity = (
  activeWhen: string | ExtensionActivityFn,
  location: Location,
): boolean => {
  if (typeof activeWhen === 'string') {
    return pathToActiveWhen(activeWhen)(location);
  }
  if (typeof activeWhen === 'function') {
    return activeWhen(location, (path, exact) => pathToActiveWhen(path, exact)(location));
  }
};

export type AkashaAppEdgeNode = DeepTarget<
  GetAppsByPublisherDidQuery,
  ['node', 'akashaAppList', 'edges', 0, 'node']
>;

export const selectLatestRelease = (extensionData: AkashaAppEdgeNode) => {
  if (extensionData.releasesCount > 0) {
    const sortedReleases = extensionData.releases.edges.slice().sort((a, b) => {
      return Date.parse(b.node.createdAt) - Date.parse(a.node.createdAt);
    });
    return sortedReleases[0];
  }
};

export const staticInstallStatusCodes = {
  error: {
    USER_NOT_CONNECTED: Symbol.for('#user-not-connected'),
    EXTENSION_NOT_FOUND: Symbol.for('#extension_not_found'),
    EXTENSION_FETCH_ERROR: Symbol.for('#extension_fetch_error'),
    EXTENSION_DATA_INVALID: Symbol.for('#extension_data_invalid'),
    EXTENSION_RELEASE_DATA_INVALID: Symbol.for('#extension_release_data_invalid'),
    EXTENSION_IMPORT_ERROR: Symbol.for('#extension_import_error'),
    EXTENSION_INITIALIZATION_FAILED: Symbol.for('#extension_initialization_failed'),
    EXTENSION_REGISTER_RESOURCES_FAILED: Symbol.for('#extension_register_resources_failed'),
    EXTENSION_REGISTRATION_FAILED: Symbol.for('#extension_registration_failed'),
    EXTENSION_INFO_SAVE_FAILED: Symbol.for('#extension_info_save_failed'),
    EXTENSION_FINALIZATION_FAILED: Symbol.for('#extension_finalization_failed'),
  },
  status: {
    FETCHING_EXTENSION_DATA: Symbol.for('#fetching_ext_data'),
    IMPORTING_MODULE: Symbol.for('#importing_module'),
    REGISTERING_RESOURCES: Symbol.for('#registering_resources'),
    REGISTERING_RESOURCES_SUCCESS: Symbol.for('#registering_resources_success'),
    INITIALIZING_EXTENSION: Symbol.for('#initialization'),
    REGISTERING_EXTENSION: Symbol.for('#registering_extension'),
    SAVING_EXTENSION_INFO: Symbol.for('#saving_extension_info'),
    FINALIZING_INSTALL: Symbol.for('#finalizing_install'),
    INSTALL_SUCCESS: Symbol.for('#install_success'),
    EXTENSION_TEST_LOAD_SUCCESS: Symbol.for('#extension_test_load_success'),
  },
};
