import { ApolloLink, Observable, split } from '@apollo/client/core';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';
import { HttpLink } from '@apollo/client/link/http';
import { ComposeClient } from '@composedb/client';
import type { Operation } from '@apollo/client/link/core/types';

/**
 * Creates an Apollo link that connects to a ComposeDB GraphQL API.
 *
 * @param options - An object with the following properties:
 *   - `getComposeDbClient`: A function that returns a `ComposeClient` instance.
 *   - `runOnComposeDbFilter`: A function that determines whether to use the ComposeDB link or the fallback link.
 *   - `graphqlURI`: The URI of the GraphQL API to use as a fallback.
 * @param useGET - Whether to use GET requests for hashed queries. Defaults to `true`.
 * @returns An Apollo link that can be used in an Apollo client.
 */
export default function createComposeDbApolloLink(
  options: {
    getComposeDbClient: () => ComposeClient;
    runOnComposeDbFilter: (op: Operation) => boolean;
    graphqlURI: string;
  },
  useGET: boolean = true,
) {
  const composeDBlink = new ApolloLink(operation => {
    return new Observable(observer => {
      options
        .getComposeDbClient()
        .execute(operation.query, operation.variables)
        .then(
          result => {
            observer.next(result);
            observer.complete();
          },
          error => {
            observer.error(error);
          },
        );
    });
  });

  return split(
    options.runOnComposeDbFilter,
    composeDBlink,
    createPersistedQueryLink({ sha256, useGETForHashedQueries: useGET }).concat(
      new HttpLink({ uri: options.graphqlURI }),
    ),
  );
}
