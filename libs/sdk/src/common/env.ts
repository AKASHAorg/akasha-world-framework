import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  client: {
    // Required
    PUBLIC_CERAMIC_API_ENDPOINT: z.string().url(),
    PUBLIC_GRAPHQL_URI: z.string().url(),
    PUBLIC_INDEXING_DID: z
      .string()
      .min(5)
      .refine(x => x.startsWith('did:'), {
        message: 'DID must start with did:',
      }),
    PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string().min(12),
    PUBLIC_PUSH_PROTOCOL_CHANNEL_ID: z.string().min(42),
    PUBLIC_W3_STORAGE_DELEGATE_BASE_URL: z.string().url(),
    // Optional Section
    PUBLIC_LOG_LEVEL: z.optional(z.enum(['info', 'warn', 'error'])),
    PUBLIC_API_STATUS_PATH: z.optional(z.string().min(1)),
  },
  runtimeEnvStrict: {
    PUBLIC_CERAMIC_API_ENDPOINT: process.env.PUBLIC_CERAMIC_API_ENDPOINT,
    PUBLIC_GRAPHQL_URI: process.env.PUBLIC_GRAPHQL_URI,
    PUBLIC_INDEXING_DID: process.env.PUBLIC_INDEXING_DID,
    PUBLIC_W3_STORAGE_DELEGATE_BASE_URL: process.env.PUBLIC_W3_STORAGE_DELEGATE_BASE_URL,
    PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
    PUBLIC_LOG_LEVEL: process.env.PUBLIC_LOG_LEVEL,
    PUBLIC_API_STATUS_PATH: process.env.PUBLIC_API_STATUS_PATH,
    PUBLIC_PUSH_PROTOCOL_CHANNEL_ID: process.env.PUBLIC_PUSH_PROTOCOL_CHANNEL_ID,
  },
  emptyStringAsUndefined: true,
});
