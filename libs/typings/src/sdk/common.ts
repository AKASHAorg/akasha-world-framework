import {
  EXTENSION_EVENTS,
  AUTH_EVENTS,
  COMMENTS_EVENTS,
  ENS_EVENTS,
  ENTRY_EVENTS,
  GQL_EVENTS,
  PROFILE_EVENTS,
  TAG_EVENTS,
  WEB3_EVENTS,
  PUSH_PROTOCOL_EVENTS,
} from './events';
import { z } from 'zod';

export const EthAddressSchema = z.string().startsWith('0x').length(42);
export type EthAddress = z.infer<typeof EthAddressSchema>;

export const TagNameSchema = z.string().min(3);
export type TagName = z.infer<typeof TagNameSchema>;

export const PubKeySchema = z.string().min(32);
export type PubKey = z.infer<typeof PubKeySchema>;

export const UsernameSchema = z.string().min(3);
export type Username = z.infer<typeof UsernameSchema>;

export const InviteCodeSchema = z.string().min(3);
export type InviteCode = z.infer<typeof InviteCodeSchema>;

export const DataProviderInputSchema = z.object({
  provider: z.string(),
  property: z.string(),
  value: z.string(),
});
export type DataProviderInput = z.infer<typeof DataProviderInputSchema>;

export type GlobalEventBusData<D = unknown> = {
  data: D;
  event:
    | AUTH_EVENTS
    | EXTENSION_EVENTS
    | COMMENTS_EVENTS
    | ENS_EVENTS
    | ENTRY_EVENTS
    | PROFILE_EVENTS
    | TAG_EVENTS
    | WEB3_EVENTS
    | PUSH_PROTOCOL_EVENTS
    | GQL_EVENTS;
  args?: unknown;
};

export const CurrentUserSchema = z.object({
  id: z.string(),
  ethAddress: EthAddressSchema.optional(),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;

export const EnsSchema = z
  .string()
  .min(3)
  .refine((v: string) => v.endsWith('.eth'));

export type Ens = z.infer<typeof EnsSchema>;

export enum LEGAL_DOCS {
  TERMS_OF_USE = 'TermsOfUse',
  TERMS_OF_SERVICE = 'TermsOfService',
  PRIVACY_POLICY = 'PrivacyPolicy',
  CODE_OF_CONDUCT = 'CodeOfConduct',
  APP_GUIDE = 'AppGuide',
}

export const LegalDocsSchema = z.nativeEnum(LEGAL_DOCS);

export enum INJECTED_PROVIDERS {
  METAMASK = 'MetaMask',
  SAFE = 'Safe',
  NIFTY = 'Nifty',
  DAPPER = 'Dapper',
  OPERA = 'Opera',
  TRUST = 'Trust',
  COINBASE = 'Coinbase',
  CIPHER = 'Cipher',
  IM_TOKEN = 'imToken',
  STATUS = 'Status',
  FALLBACK = 'Web3',
  NOT_DETECTED = 'NotDetected',
}

export enum PROVIDER_ERROR_CODES {
  UserRejected = 4001,
  WrongNetwork = 4002,
  RequestTimeout = 4003,
}
