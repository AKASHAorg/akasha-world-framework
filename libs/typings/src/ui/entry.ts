import { Descendant } from 'slate';
import {
  AkashaAppInterface,
  AkashaAppReleaseInterface,
  AkashaBeam,
  AkashaReflect,
} from '../sdk/graphql-types-new';
import { IMetadata } from './editor';

/**
 * Type defining tag object
 */
export type Tag = {
  name: string;
  totalPosts: number;
};

/**
 * Type defining interest object
 */
export type Interest = {
  labelType: string;
  value: string;
  totalPosts?: number;
};

/**
 * Interface defining data to be published
 */
export interface IPublishData {
  metadata: IMetadata;
  slateContent: (Descendant & { url?: string; type?: string; fallbackUrl?: string })[];
  textContent?: string;
  author: string | null;
  userId?: string;
}

/**
 * Type defining plain old javascript object of an entry which can either be a beam or a reflection
 */
export type EntryData = {
  id: string;
  active: boolean;
  authorId: string;
  createdAt: string;
  nsfw?: boolean;
  tags?: string[];
};

/**
 * Type defining plain old javascript object of a beam
 */
export type BeamData = EntryData & { content: AkashaBeam['content'] } & {
  reflectionsCount?: number;
  appVersionID: string;
  appID: string;
};

/**
 * Type defining plain old javascript object of a reflection
 */
export type ReflectionData = EntryData & {
  content: AkashaReflect['content'];
  beamID: AkashaReflect['beamID'];
};

/**
 * Type defining plain old javascript object of a beam data obtained from an api
 */
export type RawBeamData = Omit<AkashaBeam, 'author'> & {
  author: {
    id: string;
  };
};

/**
 * Type defining plain old javascript object of a reflection data obtained from an api
 */
export type RawReflectionData = Pick<
  AkashaReflect,
  'id' | 'active' | 'createdAt' | 'nsfw' | 'content' | 'reflection' | 'isReply'
> & {
  author: { id: string };
  beam?: { id: string };
};
