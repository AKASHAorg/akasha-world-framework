import type * as Types from './graphql-types-new';

export type IndexedBeamFragmentFragment = { beamID: string };

export type IndexedContentBlockFragmentFragment = { blockID: string };

export type IndexBeamMutationVariables = Types.Exact<{
  jws?: Types.InputMaybe<Types.Did_Jws>;
  capability?: Types.InputMaybe<Types.Cacao_Capability>;
}>;


export type IndexBeamMutation = { indexBeam?: { document?: { beamID: string } | null } | null };

export type IndexContentBlockMutationVariables = Types.Exact<{
  jws?: Types.InputMaybe<Types.Did_Jws>;
  capability?: Types.InputMaybe<Types.Cacao_Capability>;
}>;


export type IndexContentBlockMutation = { indexContentBlock?: { document?: { blockID: string } | null } | null };

export type BeamFragmentMFragment = { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appID: any, appVersionID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type ContentBlockFragmentMFragment = { id: string, active: boolean, appVersionID: any, createdAt: any, kind?: Types.AkashaContentBlockBlockDef | null, version: any, nsfw?: boolean | null, content: Array<{ propertyType: string, value: string, label: string }>, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, author: { id: string, isViewer: boolean } };

export type CreateBeamMutationVariables = Types.Exact<{
  i: Types.CreateAkashaBeamInput;
}>;


export type CreateBeamMutation = { createAkashaBeam?: { clientMutationId?: string | null, document: { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appID: any, appVersionID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } } } | null };

export type UpdateBeamMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaBeamInput;
}>;


export type UpdateBeamMutation = { updateAkashaBeam?: { clientMutationId?: string | null, document: { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appID: any, appVersionID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } } } | null };

export type CreateContentBlockMutationVariables = Types.Exact<{
  i: Types.CreateAkashaContentBlockInput;
}>;


export type CreateContentBlockMutation = { createAkashaContentBlock?: { clientMutationId?: string | null, document: { id: string, active: boolean, appVersionID: any, createdAt: any, kind?: Types.AkashaContentBlockBlockDef | null, version: any, nsfw?: boolean | null, content: Array<{ propertyType: string, value: string, label: string }>, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, author: { id: string, isViewer: boolean } } } | null };

export type UpdateContentBlockMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaContentBlockInput;
}>;


export type UpdateContentBlockMutation = { updateAkashaContentBlock?: { clientMutationId?: string | null, document: { id: string, active: boolean, appVersionID: any, createdAt: any, kind?: Types.AkashaContentBlockBlockDef | null, version: any, nsfw?: boolean | null, content: Array<{ propertyType: string, value: string, label: string }>, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, author: { id: string, isViewer: boolean } } } | null };

export type BeamFragmentFragment = { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appVersionID: any, appID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, mentions?: Array<{ id: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type ContentBlockFragmentFragment = { id: string, active: boolean, appVersionID: any, createdAt: any, kind?: Types.AkashaContentBlockBlockDef | null, version: any, nsfw?: boolean | null, content: Array<{ propertyType: string, value: string, label: string }>, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, author: { id: string, isViewer: boolean } };

export type BlockStorageFragmentFragment = { id: string, appVersionID: any, createdAt: any, active: boolean, version: any, blockID: any, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, content: Array<{ propertyType: string, label: string, value: string }>, author: { id: string, isViewer: boolean }, block?: { id: string, active: boolean, author: { id: string, isViewer: boolean } } | null };

export type GetBeamStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaBeamStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaBeamStreamSortingInput>;
}>;


export type GetBeamStreamQuery = { node?: { isViewer: boolean, akashaBeamStreamList?: { edges?: Array<{ cursor: string, node?: { beamID: any, createdAt: any, active: boolean, status?: Types.AkashaBeamStreamModerationStatus | null, moderationID?: any | null, appID?: any | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } | null } | {} | null };

export type GetBeamsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaBeamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaBeamSortingInput>;
}>;


export type GetBeamsQuery = { akashaBeamIndex?: { edges?: Array<{ cursor: string, node?: { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appVersionID: any, appID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, mentions?: Array<{ id: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetBeamsByAuthorDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaBeamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaBeamSortingInput>;
}>;


export type GetBeamsByAuthorDidQuery = { node?: { akashaBeamListCount: number, isViewer: boolean, akashaBeamList?: { edges?: Array<{ cursor: string, node?: { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appVersionID: any, appID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, mentions?: Array<{ id: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetBeamByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetBeamByIdQuery = { node?: { id: string, reflectionsCount: number, active: boolean, version: any, createdAt: any, nsfw?: boolean | null, appVersionID: any, appID: any, embeddedStream?: { label: string, embeddedID: any } | null, author: { id: string, isViewer: boolean }, content: Array<{ blockID: any, order: number }>, tags?: Array<{ labelType: string, value: string } | null> | null, mentions?: Array<{ id: string } | null> | null, reflections: { edges?: Array<{ cursor: string } | null> | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } } | {} | null };

export type GetContentBlockStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaContentBlockStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaContentBlockStreamSortingInput>;
}>;


export type GetContentBlockStreamQuery = { node?: { akashaContentBlockStreamListCount: number, isViewer: boolean, akashaContentBlockStreamList?: { edges?: Array<{ cursor: string, node?: { createdAt: any, active: boolean, status?: Types.AkashaContentBlockStreamModerationStatus | null, blockID: any, moderationID?: any | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } | null } | {} | null };

export type GetContentBlockByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetContentBlockByIdQuery = { node?: { id: string, active: boolean, appVersionID: any, createdAt: any, kind?: Types.AkashaContentBlockBlockDef | null, version: any, nsfw?: boolean | null, content: Array<{ propertyType: string, value: string, label: string }>, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, author: { id: string, isViewer: boolean } } | {} | null };

export type GetBlockStorageByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetBlockStorageByIdQuery = { node?: { id: string, appVersionID: any, createdAt: any, active: boolean, version: any, blockID: any, appVersion?: { applicationID: any, id: string, version: string, application?: { name: string, displayName: string, id: string } | null } | null, content: Array<{ propertyType: string, label: string, value: string }>, author: { id: string, isViewer: boolean }, block?: { id: string, active: boolean, author: { id: string, isViewer: boolean } } | null } | {} | null };

export type GetIndexedStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaIndexedStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaIndexedStreamSortingInput>;
}>;


export type GetIndexedStreamQuery = { node?: { akashaIndexedStreamListCount: number, isViewer: boolean, akashaIndexedStreamList?: { edges?: Array<{ cursor: string, node?: { createdAt: any, active: boolean, status?: Types.AkashaIndexedStreamModerationStatus | null, indexValue: string, indexType: string, stream: any, streamType?: Types.AkashaIndexedStreamStreamType | null, moderationID?: any | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } | null } | {} | null };

export type GetIndexedStreamCountQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  filters?: Types.InputMaybe<Types.AkashaIndexedStreamFiltersInput>;
}>;


export type GetIndexedStreamCountQuery = { node?: { akashaIndexedStreamListCount: number, isViewer: boolean } | {} | null };

export type IndexedReflectFragmentFragment = { reflectionID: string };

export type IndexReflectionMutationVariables = Types.Exact<{
  jws?: Types.InputMaybe<Types.Did_Jws>;
  capability?: Types.InputMaybe<Types.Cacao_Capability>;
}>;


export type IndexReflectionMutation = { indexReflection?: { document?: { reflectionID: string } | null } | null };

export type ReflectFragmentMFragment = { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null };

export type CreateReflectMutationVariables = Types.Exact<{
  i: Types.CreateAkashaReflectInput;
}>;


export type CreateReflectMutation = { createAkashaReflect?: { clientMutationId?: string | null, document: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } } | null };

export type UpdateAkashaReflectMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaReflectInput;
}>;


export type UpdateAkashaReflectMutation = { updateAkashaReflect?: { clientMutationId?: string | null, document: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } } | null };

export type ReflectFragmentFragment = { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null };

export type GetReflectionsFromBeamQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaReflectInterfaceSortingInput>;
  filters?: Types.InputMaybe<Types.AkashaReflectInterfaceFiltersInput>;
}>;


export type GetReflectionsFromBeamQuery = { node?: { reflectionsCount: number, reflections: { edges?: Array<{ cursor: string, node?: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } } | {} | null };

export type GetReflectionsByAuthorDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaReflectFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaReflectSortingInput>;
}>;


export type GetReflectionsByAuthorDidQuery = { node?: { isViewer: boolean, akashaReflectList?: { edges?: Array<{ cursor: string, node?: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetReflectionStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaReflectStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaReflectStreamSortingInput>;
}>;


export type GetReflectionStreamQuery = { node?: { isViewer: boolean, akashaReflectStreamList?: { edges?: Array<{ cursor: string, node?: { reflectionID: any, moderationID?: any | null, beamID: any, active: boolean, status?: Types.AkashaReflectStreamModerationStatus | null, createdAt: any, isReply?: boolean | null, replyTo?: any | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetReflectionByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetReflectionByIdQuery = { node?: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } | {} | null };

export type GetReflectReflectionsQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaReflectSortingInput>;
}>;


export type GetReflectReflectionsQuery = { akashaReflectIndex?: { edges?: Array<{ cursor: string, node?: { id: string, version: any, active: boolean, isReply?: boolean | null, reflection?: any | null, createdAt: any, nsfw?: boolean | null, author: { id: string, isViewer: boolean }, content: Array<{ label: string, propertyType: string, value: string }>, beam?: { id: string, author: { id: string, isViewer: boolean } } | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type IndexedProfileFragmentFragment = { profileID: string };

export type IndexProfileMutationVariables = Types.Exact<{
  jws?: Types.InputMaybe<Types.Did_Jws>;
  capability?: Types.InputMaybe<Types.Cacao_Capability>;
}>;


export type IndexProfileMutation = { indexProfile?: { document?: { profileID: string } | null } | null };

export type UserProfileFragmentMFragment = { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } };

export type CreateProfileMutationVariables = Types.Exact<{
  i: Types.SetAkashaProfileInput;
}>;


export type CreateProfileMutation = { setAkashaProfile?: { clientMutationId?: string | null, document: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } } | null };

export type UpdateProfileMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaProfileInput;
}>;


export type UpdateProfileMutation = { updateAkashaProfile?: { clientMutationId?: string | null, document: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } } | null };

export type CreateInterestsMutationVariables = Types.Exact<{
  i: Types.SetAkashaProfileInterestsInput;
}>;


export type CreateInterestsMutation = { setAkashaProfileInterests?: { clientMutationId?: string | null, document: { id: string, topics: Array<{ value: string, labelType: string }>, did: { id: string } } } | null };

export type UpdateInterestsMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaProfileInterestsInput;
}>;


export type UpdateInterestsMutation = { updateAkashaProfileInterests?: { clientMutationId?: string | null, document: { id: string, topics: Array<{ value: string, labelType: string }>, did: { id: string } } } | null };

export type CreateFollowMutationVariables = Types.Exact<{
  i: Types.SetAkashaFollowInput;
}>;


export type CreateFollowMutation = { setAkashaFollow?: { document: { isFollowing: boolean, id: string, profile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null, did: { id: string } } } | null };

export type UpdateFollowMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaFollowInput;
}>;


export type UpdateFollowMutation = { updateAkashaFollow?: { document: { isFollowing: boolean, id: string, profile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null, did: { id: string } } } | null };

export type GetMyProfileQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetMyProfileQuery = { viewer?: { akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null };

export type GetFollowDocumentsByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaFollowSortingInput>;
  following?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type GetFollowDocumentsByDidQuery = { node?: { isViewer: boolean, akashaFollowList?: { edges?: Array<{ cursor: string, node?: { id: string, isFollowing: boolean, profileID: any, profile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type UserProfileFragmentFragment = { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } };

export type GetProfileByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetProfileByIdQuery = { node?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | {} | null };

export type GetProfileByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetProfileByDidQuery = { node?: { isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | {} | null };

export type GetProfilesQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaProfileFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaProfileSortingInput>;
}>;


export type GetProfilesQuery = { akashaProfileIndex?: { edges?: Array<{ cursor: string, node?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetProfileStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaProfileStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaProfileStreamSortingInput>;
}>;


export type GetProfileStreamQuery = { node?: { akashaProfileStreamList?: { edges?: Array<{ cursor: string, node?: { profileID: any, active: boolean, createdAt: any, moderationID?: any | null, status?: Types.AkashaProfileStreamModerationStatus | null, appID?: any | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetInterestsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetInterestsQuery = { akashaProfileInterestsIndex?: { edges?: Array<{ cursor: string, node?: { id: string, topics: Array<{ value: string, labelType: string }>, did: { id: string } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetInterestsStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaInterestsStreamSortingInput>;
  filters?: Types.InputMaybe<Types.AkashaInterestsStreamFiltersInput>;
}>;


export type GetInterestsStreamQuery = { node?: { akashaInterestsStreamList?: { edges?: Array<{ cursor: string, node?: { labelType: string, value: string, active: boolean, createdAt: any, id: string } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetInterestsByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetInterestsByDidQuery = { node?: { isViewer: boolean, akashaProfileInterests?: { id: string, topics: Array<{ value: string, labelType: string }>, did: { id: string } } | null } | {} | null };

export type GetInterestsByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetInterestsByIdQuery = { node?: { id: string, topics: Array<{ value: string, labelType: string }>, did: { id: string } } | {} | null };

export type GetFollowingListByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaFollowSortingInput>;
}>;


export type GetFollowingListByDidQuery = { node?: { isViewer: boolean, akashaFollowList?: { edges?: Array<{ cursor: string, node?: { id: string, isFollowing: boolean, profileID: any, profile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null, did: { id: string } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetFollowersListByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sorting?: Types.InputMaybe<Types.AkashaFollowInterfaceSortingInput>;
}>;


export type GetFollowersListByDidQuery = { node?: { isViewer: boolean, akashaProfile?: { followers: { edges?: Array<{ cursor: string, node?: { id: string, isFollowing: boolean, profileID: any, profile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null, did: { akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } } | null } | {} | null };

export type GetProfileStatsByDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetProfileStatsByDidQuery = { node?: { akashaFollowListCount: number, akashaBeamListCount: number, akashaReflectListCount: number, isViewer: boolean, akashaProfile?: { followersCount: number, id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | {} | null };

export type AkashaAppFragmentMFragment = { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null };

export type AppReleaseFragmentMFragment = { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null } | null };

export type SetAppReleaseMutationVariables = Types.Exact<{
  i: Types.SetAkashaAppReleaseInput;
}>;


export type SetAppReleaseMutation = { setAkashaAppRelease?: { clientMutationId?: string | null, document: { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null } | null } } | null };

export type UpdateAppReleaseMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaAppReleaseInput;
}>;


export type UpdateAppReleaseMutation = { updateAkashaAppRelease?: { clientMutationId?: string | null, document: { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null } | null } } | null };

export type CreateAppMutationVariables = Types.Exact<{
  i: Types.SetAkashaAppInput;
}>;


export type CreateAppMutation = { setAkashaApp?: { clientMutationId?: string | null, document: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null } } | null };

export type UpdateAppMutationVariables = Types.Exact<{
  i: Types.UpdateAkashaAppInput;
}>;


export type UpdateAppMutation = { updateAkashaApp?: { clientMutationId?: string | null, document: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appID: any, appVersionID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null } } | null };

export type AkashaAppFragmentFragment = { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null };

export type AppReleaseFragmentFragment = { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null, meta?: Array<{ provider: string, property: string, value: string } | null> | null };

export type GetAppsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaAppFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaAppSortingInput>;
}>;


export type GetAppsQuery = { akashaAppIndex?: { edges?: Array<{ cursor: string, node?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetAppsStreamQueryVariables = Types.Exact<{
  indexer: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaAppsStreamFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaAppsStreamSortingInput>;
}>;


export type GetAppsStreamQuery = { node?: { akashaAppsStreamList?: { edges?: Array<{ cursor: string, node?: { moderationID?: any | null, active: boolean, applicationID: any, status?: Types.AkashaAppsStreamModerationStatus | null, createdAt: any } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetAppsByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetAppsByIdQuery = { node?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | {} | null };

export type GetAppsByPublisherDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaAppFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaAppSortingInput>;
}>;


export type GetAppsByPublisherDidQuery = { node?: { akashaAppList?: { edges?: Array<{ cursor: string, node?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetAppsReleasesByPublisherDidQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaAppReleaseFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaAppReleaseSortingInput>;
}>;


export type GetAppsReleasesByPublisherDidQuery = { node?: { akashaAppReleaseList?: { edges?: Array<{ cursor: string, node?: { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null, meta?: Array<{ provider: string, property: string, value: string } | null> | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | {} | null };

export type GetAppsReleasesQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  filters?: Types.InputMaybe<Types.AkashaAppReleaseFiltersInput>;
  sorting?: Types.InputMaybe<Types.AkashaAppReleaseSortingInput>;
}>;


export type GetAppsReleasesQuery = { akashaAppReleaseIndex?: { edges?: Array<{ cursor: string, node?: { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null, meta?: Array<{ provider: string, property: string, value: string } | null> | null } | null } | null> | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetAppReleaseByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetAppReleaseByIdQuery = { node?: { applicationID: any, id: string, source: any, version: string, createdAt: any, application?: { id: string, applicationType?: Types.AkashaAppApplicationType | null, description: string, license: string, name: string, displayName: string, keywords?: Array<string | null> | null, createdAt: any, releasesCount: number, releases: { edges?: Array<{ cursor: string, node?: { id: string, createdAt: any, source: any, version: string, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null } | null> | null }, author: { id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null }, logoImage?: { height?: number | null, width?: number | null, src: any } | null, coverImage?: { height?: number | null, width?: number | null, src: any } | null, gallery?: Array<{ height?: number | null, width?: number | null, src: any } | null> | null, links?: Array<{ href: any, label?: string | null } | null> | null, contributors?: Array<{ id: string, isViewer: boolean, akashaProfile?: { id: string, name: string, description?: string | null, appVersionID: any, appID: any, createdAt: any, nsfw?: boolean | null, did: { id: string, isViewer: boolean }, links?: Array<{ href: any, label?: string | null } | null> | null, background?: { alternatives?: Array<{ src: any, width: number, height: number } | null> | null, default: { src: any, width: number, height: number } } | null, avatar?: { default: { src: any, width: number, height: number }, alternatives?: Array<{ src: any, width: number, height: number } | null> | null } | null, followers: { pageInfo: { startCursor?: string | null, endCursor?: string | null, hasPreviousPage: boolean, hasNextPage: boolean } } } | null } | null> | null, meta?: Array<{ property: string, provider: string, value: string } | null> | null } | null, meta?: Array<{ provider: string, property: string, value: string } | null> | null } | {} | null };
