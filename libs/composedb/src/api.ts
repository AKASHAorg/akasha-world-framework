import type { DocumentNode } from 'graphql';
import { ApolloClient, gql } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import type { FetchResult } from '@apollo/client/link/core/types';
import { getSdk } from './__generated__/graphql-api';

/**
 * Creates a GraphQL requester function that can be used to execute queries and mutations against an Apollo client.
 *
 * @param apolloClient - The Apollo client instance to use for making GraphQL requests.
 * @returns A function that can be used to execute GraphQL queries and mutations.
 */
export function createRequester(apolloClient: ApolloClient<unknown>) {
  return async <R, V>(
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
    const definition = getMainDefinition(query);
    let result: FetchResult<unknown, Record<string, unknown>, Record<string, unknown>>;
    const context = {
      ...options?.context,
    };
    if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
      result = await apolloClient.mutate({
        mutation: query,
        variables: vars as Record<string, unknown> | undefined,
        context: context,
      });
    } else {
      result = await apolloClient.query({
        query: query,
        variables: vars as Record<string, unknown> | undefined,
        context: context,
      });
    }

    if (!result.errors || !result.errors.length) {
      return result.data as R;
    }

    throw result.errors;
  };
}

/**
 * Creates an API object that provides access to the GraphQL API using the provided Apollo client.
 *
 * @param apolloClient - The Apollo client instance to use for making GraphQL requests.
 * @returns An API object with methods for executing GraphQL queries and mutations.
 */
export default function createApi(apolloClient: ApolloClient<unknown>) {
  return getSdk(createRequester(apolloClient));
}
