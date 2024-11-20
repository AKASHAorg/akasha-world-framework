import { inject, injectable } from 'inversify';
import { GQL_EVENTS, TYPES } from '@akashaorg/typings/lib/sdk';

import Logging from '../logging';
import pino from 'pino';
import CeramicService from '../common/ceramic';
import type { DocumentNode } from 'graphql';
import EventBus from '../common/event-bus';
import { validate } from '../common/validator';
import { z } from 'zod';
import type { FetchResult } from '@apollo/client/link/core/types';

import { ApolloClient, gql } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';

import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';

import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { VIEWER_ID_HEADER } from '@composedb/constants';
import AWF_Config from '../common/config';
import createComposeDbApolloLink from '@akashaorg/composedb-models/lib/apollo-link';
import { getSdk, Sdk } from '@akashaorg/composedb-models/lib/__generated__/graphql-api';

const enum ContextSources {
  DEFAULT = 'gql#DEFAULT',
  COMPOSEDB = 'gql#COMPOSEDB',
}

export const LabelTypes = {
  TAG: 'core#tag',
  CATEGORY: 'core#category',
  INTEREST: 'core#interest',
  MENTION: 'core#mention',
} as const;

const __DEV__: boolean = process.env.NODE_ENV !== 'production';

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

/** @internal  */
@injectable()
class Gql {
  readonly _client: Sdk;
  readonly _ceramic: CeramicService;
  readonly apolloClient: ApolloClient<any>;
  // #_clientWithCache: Sdk;
  private _log: pino.Logger;
  private _globalChannel: EventBus;
  private _viewerID: string;
  private readonly _apolloCache: InMemoryCache;
  private readonly _contextSources: { default: symbol; composeDB: symbol };
  private _config: AWF_Config;

  public constructor(
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Ceramic) ceramic: CeramicService,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Config) config: AWF_Config,
  ) {
    this._log = log.create('AWF_GQL');
    this._globalChannel = globalChannel;
    this._ceramic = ceramic;
    this._viewerID = '';
    this._config = config;
    this._contextSources = Object.freeze({
      default: Symbol.for(ContextSources.DEFAULT),
      composeDB: Symbol.for(ContextSources.COMPOSEDB),
    });

    const directionalLink = createComposeDbApolloLink(
      {
        getComposeDbClient: () => this._ceramic.getComposeClient(),
        runOnComposeDbFilter: op => {
          return op.getContext().source === this.contextSources.composeDB;
        },
        graphqlURI: this._config.getOption('graphql_uri') || 'http://localhost:4112/',
      },
      true,
    );

    this._apolloCache = new InMemoryCache({
      typePolicies: {
        AkashaBeam: {
          merge: true,
        },
        AkashaReflectConnection: {
          merge: true,
        },
        AkashaFollow: {
          merge: true,
        },
        CeramicAccount: {
          merge: true,
          fields: {
            akashaProfile: {
              merge(existing = {}, incoming) {
                return { ...existing, ...incoming };
              },
            },
            akashaFollowList: relayStylePagination(['sorting', 'filters']),
            akashaBeamStreamList: relayStylePagination(['sorting', 'filters']),
            akashaReflectStreamList: relayStylePagination(['sorting', 'filters']),
            akashaBeamList: relayStylePagination(['sorting', 'filters']),
            akashaAppList: relayStylePagination(['sorting', 'filters']),
          },
        },
        Query: {
          fields: {
            akashaBeamIndex: relayStylePagination(['sorting', 'filters']),
            akashaAppReleaseIndex: relayStylePagination(['sorting', 'filters']),
          },
        },
      },
    });

    this.apolloClient = new ApolloClient({
      cache: this._apolloCache,
      link: directionalLink,
      version: '0.1.1dev',
      devtools: {
        enabled: __DEV__,
      },
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'network-only',
          nextFetchPolicy: 'cache-and-network',
        },
      },
    });

    this._client = getSdk(this.requester);
  }

  get queryClient() {
    return this.apolloClient;
  }

  get contextSources() {
    return this._contextSources;
  }

  get labelTypes() {
    return LabelTypes;
  }

  get indexingDID() {
    return this._config.getOption('indexing_did');
  }

  get mutationNotificationConfig() {
    return Object.freeze({
      optionName: 'EmitNotification',
    });
  }

  get client() {
    return this._client;
  }

  /*
   * requester
   *
   * Sends a GraphQL operation to the Apollo client and handles errors.
   *
   * Parameters:
   *
   * - doc: The GraphQL document node or string
   * - vars: Optional variables
   * - options: Additional context options
   *
   * Returns:
   *
   * - The result data for queries
   *
   * For mutations:
   *
   * - Generates a UUID
   * - Publishes mutation notifications via globalChannel
   * - Stores errors in sessionStorage
   * - Throws errors
   *
   * Checks if doc is a string and converts to DocumentNode.
   *
   * Checks for mutation and handles notifications.
   *
   * Otherwise sends as standard query.
   *
   * Throws errors if present.
   */
  public requester = async <R, V>(
    doc: DocumentNode | string,
    vars?: V,
    options?: Record<string, any>,
  ): Promise<R> => {
    let query: DocumentNode;
    if (typeof doc === 'string') {
      query = gql(doc);
    } else {
      query = doc;
    }
    let uuid = '';
    const definition = getMainDefinition(query);
    const context = {
      ...options?.context,
      headers: this._viewerID
        ? {
            [VIEWER_ID_HEADER]: this._viewerID,
          }
        : {},
    };
    let result: FetchResult<unknown, Record<string, unknown>, Record<string, unknown>>;
    if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
      uuid = crypto.randomUUID();
      if (typeof globalThis.sessionStorage !== 'undefined') {
        globalThis.sessionStorage.setItem(
          uuid,
          JSON.stringify({ variables: definition.variableDefinitions }),
        );
      }
      this._globalChannel.next({
        data: { uuid, success: false, pending: true },
        event: GQL_EVENTS.MUTATION,
      });
      result = await this.apolloClient.mutate({
        mutation: query,
        variables: vars as Record<string, unknown> | undefined,
        context: context,
      });
    } else {
      result = await this.apolloClient.query({
        query: query,
        variables: vars as Record<string, unknown> | undefined,
        context: context,
      });
    }

    if (!result.errors || !result.errors.length) {
      if (uuid) {
        this._globalChannel.next({
          data: { uuid, success: true, pending: false, variables: definition.variableDefinitions },
          event: GQL_EVENTS.MUTATION,
        });
      }
      return result.data as R;
    }

    sessionStorage.setItem(uuid, JSON.stringify({ errors: JSON.stringify(result.errors) }));
    this._globalChannel.next({
      data: { uuid, success: false, errors: result.errors, pending: false },
      event: GQL_EVENTS.MUTATION,
    });
    throw result.errors;
  };

  async resetCache() {
    return this._apolloCache.reset();
  }

  async setContextViewerID(id: string) {
    this._viewerID = id;
    await this.resetCache();
  }

  @validate(z.string().min(20))
  consumeMutationNotificationObject(uuid: string) {
    const notification = sessionStorage.getItem(uuid);
    sessionStorage.removeItem(uuid);
    if (!notification) {
      return;
    }
    try {
      return JSON.parse(notification);
    } catch (e) {
      this._log.warn(e);
      return;
    }
  }

  /**
   * @deprecated Use client method instead
   */
  getAPI() {
    return this._client;
  }
}

export default Gql;
