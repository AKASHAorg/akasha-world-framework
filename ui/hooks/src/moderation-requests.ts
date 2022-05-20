import getSDK from '@akashaorg/awf-sdk';

import constants from './constants';

const {
  BASE_REPORT_URL,
  BASE_STATUS_URL,
  BASE_REASONS_URL,
  BASE_DECISION_URL,
  BASE_MODERATOR_URL,
  DEFAULT_FETCH_TIMEOUT,
  PENDING_CACHE_KEY_PREFIX,
  MODERATED_CACHE_KEY_PREFIX,
  MODERATION_COUNT_CACHE_KEY_PREFIX,
} = constants;

type Profile = {
  pubKey: string;
  ethAddress: string;
  name: string;
  userName: string;
  avatar: string;
};

export interface ModerationStatus {
  contentId: string;
  delisted: boolean;
  moderated: boolean;
  reason: string;
  reported: boolean;
}

export interface Reason {
  _id: string;
  _mod: Date;
  creationDate: Date;
  active: boolean;
  description: string;
  label: string;
}

export interface ICount {
  kept: number;
  pending: number;
  delisted: number;
}

export interface EntryReport {
  _id: string;
  _mod: Date;
  creationDate: Date;
  author: string;
  contentID: string;
  contentType: string;
  explanation: string;
  reason: string;
}

export interface ILogItem {
  contentID: string;
  contentType: string;
  delisted: false;
  reasons: string[];
  explanation: string;
  moderator: Profile;
  moderatedDate: Date;
  reports: number;
}

export interface IPendingItem {
  _id: string;
  _mod: Date;
  creationDate: Date;
  contentID: string;
  contentType: string;
  delisted: boolean;
  moderated: boolean;
  reasons: string[];
  explanation: string;
  reportedBy: string;
  reportedByProfile: Profile;
  reportedDate: Date;
  reports: number;
  count: number;
}

export interface IModeratedItem extends IPendingItem {
  moderator: string;
  moderatedDate?: Date;
  evaluationDate?: Date;
  moderatorProfile: Profile;
}

interface PaginatedResponse {
  nextIndex: string | null;
  total: number;
}

export interface LogItemsReponse extends PaginatedResponse {
  results: ILogItem[];
}

export interface PendingItemsReponse extends PaginatedResponse {
  results: IPendingItem[];
}

export interface ModeratedItemsReponse extends PaginatedResponse {
  results: IModeratedItem[];
}

/**
 * Creates moderation entry
 * @param url - the request url
 * @param data - moderation data specifying content id, type, signed data and signature
 * @param timeout - duration after which request times out
 * @returns - status of the response
 */
export const createModeration = async (
  url: string,
  data: {
    contentId: string;
    contentType: string;
    data: { [key: string]: string };
    signature: string;
  },
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<number> => {
  const rheaders = new Headers();

  const sdk = getSDK();

  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url,
    data: data,
    statusOnly: true,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as number;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  uiCache.set(key, response.status);

  return response.status;
};

/**
 * Checks the moderation status (reported, delisted, kept) of entries
 * @param data - specifies user pubkey and a list of entries' contentIds
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getEntryModerationStatus = async (
  data: {
    user: string;
    contentIds: string[];
  },
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<ModerationStatus[]> => {
  const rheaders = new Headers();

  const sdk = getSDK();

  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: BASE_STATUS_URL,
    data: data,
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as ModerationStatus[];
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(BASE_STATUS_URL, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(key, serializedResponse);
    return serializedResponse;
  });
};

/**
 * Gets predefined moderation reasons
 * @param data - specifies the status of reasons to be returned
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getModerationReasons = async (
  data: Record<string, unknown>,
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<Reason[]> => {
  const rheaders = new Headers();

  const sdk = getSDK();

  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: BASE_REASONS_URL,
    data: data,
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as Reason[];
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(BASE_REASONS_URL, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(key, serializedResponse);
    return serializedResponse;
  });
};

/**
 * Determines if a logged in user is a moderator or not
 * @param loggedUser - pubkey of logged in user
 * @param timeout - duration after which request times out
 * @returns response HTTP status code
 */
export const getModeratorStatus = async (
  loggedUser: string,
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<number> => {
  const rheaders = new Headers();
  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'HEAD',
    url: `${BASE_MODERATOR_URL}/${loggedUser}`,
    data: {},
    statusOnly: true,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as number;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_MODERATOR_URL}/${loggedUser}`, {
    signal: controller.signal,
    method: 'HEAD',
    headers: rheaders,
  });

  clearTimeout(timer);

  uiCache.set(key, response.status);

  return response.status;
};

/**
 * Gets a detailed breakdown of moderation items
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getModerationCounters = async (timeout = DEFAULT_FETCH_TIMEOUT): Promise<ICount> => {
  const rheaders = new Headers();
  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'GET',
    url: `${BASE_STATUS_URL}/counters`,
    data: {},
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(`${MODERATION_COUNT_CACHE_KEY_PREFIX}-${key}`)) {
    return uiCache.get(`${MODERATION_COUNT_CACHE_KEY_PREFIX}-${key}`) as ICount;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_STATUS_URL}/counters`, {
    signal: controller.signal,
    method: 'GET',
    headers: rheaders,
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(`${MODERATION_COUNT_CACHE_KEY_PREFIX}-${key}`, serializedResponse);
    return serializedResponse;
  });
};

/**
 * Gets the reports for a specific entry
 * @param entryId - id of the entry
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getEntryReports = async (
  entryId: string,
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<EntryReport[]> => {
  const rheaders = new Headers();
  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: `${BASE_REPORT_URL}/list/${entryId}`,
    data: {},
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as EntryReport[];
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_REPORT_URL}/list/${entryId}`, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(key, serializedResponse);
    return serializedResponse;
  });
};

/**
 * Gets log of moderated items
 * @param data - limit and offset for the request
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getLogItems = async (
  data: {
    limit?: number;
    offset?: string;
  },
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<LogItemsReponse> => {
  const rheaders = new Headers();
  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: `${BASE_DECISION_URL}/log`,
    data,
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(key)) {
    return uiCache.get(key) as LogItemsReponse;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_DECISION_URL}/log`, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(key, serializedResponse);
    return serializedResponse;
  });
};

/**
 * Gets pending moderation items
 * @param data - limit and offset for the request
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getPendingItems = async (
  data: {
    limit?: number;
    offset?: string;
  },
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<PendingItemsReponse> => {
  const rheaders = new Headers();

  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: `${BASE_DECISION_URL}/pending`,
    data,
    statusOnly: false,
  });

  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(`${PENDING_CACHE_KEY_PREFIX}-${key}`)) {
    return uiCache.get(`${PENDING_CACHE_KEY_PREFIX}-${key}`) as PendingItemsReponse;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_DECISION_URL}/pending`, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(`${PENDING_CACHE_KEY_PREFIX}-${key}`, serializedResponse);
    return {
      ...serializedResponse,
      results: serializedResponse.results.map((item: IPendingItem) => {
        // formatting data to match labels already in use
        return {
          ...item,
          count: item.reports - 1, // minus reporter, to get count of other users
        };
      }),
    };
  });
};

/**
 * Gets moderated items
 * @param data - limit and offset for the request, specify delisted flag as true to return delisted items, otherwise kept items
 * @param timeout - duration after which request times out
 * @returns serialized response
 */
export const getModeratedItems = async (
  data: {
    delisted: boolean;
    limit?: number;
    offset?: string;
  },
  timeout = DEFAULT_FETCH_TIMEOUT,
): Promise<ModeratedItemsReponse> => {
  const rheaders = new Headers();

  const sdk = getSDK();
  const key = sdk.services.stash.computeKey({
    method: 'POST',
    url: `${BASE_DECISION_URL}/moderated`,
    data: data,
    statusOnly: false,
  });
  const uiCache = sdk.services.stash.getUiStash();
  if (uiCache.has(`${MODERATED_CACHE_KEY_PREFIX}-${key}`)) {
    return uiCache.get(`${MODERATED_CACHE_KEY_PREFIX}-${key}`) as ModeratedItemsReponse;
  }
  rheaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(`${BASE_DECISION_URL}/moderated`, {
    signal: controller.signal,
    method: 'POST',
    headers: rheaders,
    body: JSON.stringify(data),
  });

  clearTimeout(timer);

  return response.json().then(serializedResponse => {
    uiCache.set(`${MODERATED_CACHE_KEY_PREFIX}-${key}`, serializedResponse);
    return {
      ...serializedResponse,
      results: serializedResponse.results.map((item: IModeratedItem) => {
        // formatting data to match labels already in use
        return {
          ...item,
          count: item.reports - 1,
        };
      }),
    };
  });
};
