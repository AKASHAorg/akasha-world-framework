// @ts-check

/** @type {import('graphql-config').IGraphQLConfig } */
const config = {
  projects: {
    default: {
      schema: '../composedb/lib/supergraph.graphql', //can be also an url
      documents: ['src/**/*.graphql'],
      extensions: {
        codegen: {
          emitLegacyCommonJSImports: false,
          generates: {
            '../typings/src/sdk/graphql-types-new.ts': {
              plugins: ['typescript'],
              config: {
                federation: true,
                skipTypename: true,
              },
            },
            '../typings/src/sdk/graphql-operation-types-new.ts': {
              preset: 'import-types-preset',
              presetConfig: {
                typesPath: './graphql-types-new',
              },
              plugins: ['typescript-operations'],
              config: {
                federation: true,
                skipTypename: true,
                useTypeImports: true,
              },
            },
            '../composedb/src/__generated__/graphql-api.ts': {
              preset: 'import-types-preset',
              presetConfig: {
                typesPath: '@akashaorg/typings/lib/sdk/graphql-operation-types-new',
              },
              plugins: ['@graphql-codegen/typescript-generic-sdk'],
              config: {
                federation: true,
                skipTypename: true,
                dedupeOperationSuffix: true,
                dedupeFragments: true,
                pureMagicComment: true,
                useTypeImports: true,
              },
            },
            '../hooks/src/generated/apollo.ts': {
              preset: 'import-types-preset',
              presetConfig: {
                typesPath: '@akashaorg/typings/lib/sdk/graphql-operation-types-new',
              },
              plugins: ['typescript-react-apollo'],
              config: {
                federation: true,
                skipTypename: true,
                dedupeOperationSuffix: true,
                dedupeFragments: true,
                pureMagicComment: true,
                useTypeImports: true,
                addInfiniteQuery: true,
                legacyMode: false,
                exposeDocument: true,
                exposeQueryKeys: true,
                exposeMutationKeys: true,
              },
            },
            '../typings/src/sdk/graphql-resolver-types-new.ts': {
              preset: 'import-types-preset',
              presetConfig: {
                typesPath: './graphql-types-new',
              },
              plugins: ['typescript-resolvers'],
              config: {
                federation: true,
                skipTypename: true,
                useTypeImports: true,
              },
            },
          },
        },
      },
    },
  },
};

module.exports = config;
