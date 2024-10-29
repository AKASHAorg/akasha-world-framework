import type * as Types from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';

import type { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
export const IndexedBeamFragmentDoc = /*#__PURE__*/ gql`
    fragment IndexedBeamFragment on IndexBeamPayloadDocument {
  beamID
}
    `;
export const IndexedContentBlockFragmentDoc = /*#__PURE__*/ gql`
    fragment IndexedContentBlockFragment on IndexContentBlockPayloadDocument {
  blockID
}
    `;
export const BeamFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment BeamFragmentM on AkashaBeam {
  id
  reflectionsCount
  active
  embeddedStream {
    label
    embeddedID
  }
  author {
    id
    isViewer
  }
  content {
    blockID
    order
  }
  tags {
    labelType
    value
  }
  version
  createdAt
  nsfw
  appID
  appVersionID
  reflections(last: 1) {
    edges {
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;
export const ContentBlockFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment ContentBlockFragmentM on AkashaContentBlock {
  id
  content {
    propertyType
    value
    label
  }
  active
  appVersion {
    application {
      name
      displayName
      id
    }
    applicationID
    id
    version
  }
  appVersionID
  createdAt
  kind
  author {
    id
    isViewer
  }
  version
  nsfw
}
    `;
export const BeamFragmentDoc = /*#__PURE__*/ gql`
    fragment BeamFragment on AkashaBeam {
  id
  reflectionsCount
  active
  embeddedStream {
    label
    embeddedID
  }
  author {
    id
    isViewer
  }
  content {
    blockID
    order
  }
  tags {
    labelType
    value
  }
  mentions {
    id
  }
  version
  createdAt
  nsfw
  appVersionID
  appID
  reflections(last: 1) {
    edges {
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;
export const ContentBlockFragmentDoc = /*#__PURE__*/ gql`
    fragment ContentBlockFragment on AkashaContentBlock {
  id
  content {
    propertyType
    value
    label
  }
  active
  appVersion {
    application {
      name
      displayName
      id
    }
    applicationID
    id
    version
  }
  appVersionID
  createdAt
  kind
  author {
    id
    isViewer
  }
  version
  nsfw
}
    `;
export const BlockStorageFragmentDoc = /*#__PURE__*/ gql`
    fragment BlockStorageFragment on AkashaBlockStorage {
  id
  appVersionID
  appVersion {
    application {
      name
      displayName
      id
    }
    applicationID
    id
    version
  }
  createdAt
  active
  version
  content {
    propertyType
    label
    value
  }
  author {
    id
    isViewer
  }
  blockID
  block {
    id
    active
    author {
      id
      isViewer
    }
  }
}
    `;
export const IndexedReflectFragmentDoc = /*#__PURE__*/ gql`
    fragment IndexedReflectFragment on IndexReflectPayloadDocument {
  reflectionID
}
    `;
export const ReflectFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment ReflectFragmentM on AkashaReflect {
  id
  author {
    id
    isViewer
  }
  version
  active
  content {
    label
    propertyType
    value
  }
  isReply
  reflection
  createdAt
  beam {
    id
    author {
      id
      isViewer
    }
  }
  nsfw
}
    `;
export const ReflectFragmentDoc = /*#__PURE__*/ gql`
    fragment ReflectFragment on AkashaReflect {
  id
  author {
    id
    isViewer
  }
  version
  active
  content {
    label
    propertyType
    value
  }
  isReply
  reflection
  createdAt
  beam {
    id
    author {
      id
      isViewer
    }
  }
  nsfw
}
    `;
export const IndexedProfileFragmentDoc = /*#__PURE__*/ gql`
    fragment IndexedProfileFragment on IndexProfilePayloadDocument {
  profileID
}
    `;
export const UserProfileFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment UserProfileFragmentM on AkashaProfile {
  id
  did {
    id
    isViewer
  }
  name
  links {
    href
    label
  }
  background {
    alternatives {
      src
      width
      height
    }
    default {
      src
      width
      height
    }
  }
  description
  avatar {
    default {
      src
      width
      height
    }
    alternatives {
      src
      width
      height
    }
  }
  followers(last: 5) {
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
    }
  }
  appID
  appVersionID
  createdAt
  nsfw
}
    `;
export const AkashaAppFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment AkashaAppFragmentM on AkashaApp {
  id
  applicationType
  description
  license
  name
  displayName
  keywords
  releases(first: 5, sorting: {createdAt: DESC}) {
    edges {
      node {
        id
        createdAt
        source
        version
      }
      cursor
    }
  }
  releasesCount
  author {
    id
    isViewer
    akashaProfile {
      ...UserProfileFragmentM
    }
  }
  contributors {
    id
    isViewer
    akashaProfile {
      ...UserProfileFragmentM
    }
  }
}
    `;
export const AppReleaseFragmentMFragmentDoc = /*#__PURE__*/ gql`
    fragment AppReleaseFragmentM on AkashaAppRelease {
  application {
    ...AkashaAppFragmentM
  }
  applicationID
  id
  source
  version
  createdAt
}
    `;
export const UserProfileFragmentDoc = /*#__PURE__*/ gql`
    fragment UserProfileFragment on AkashaProfile {
  id
  did {
    id
    isViewer
  }
  name
  links {
    href
    label
  }
  background {
    alternatives {
      src
      width
      height
    }
    default {
      src
      width
      height
    }
  }
  description
  appVersionID
  appID
  avatar {
    default {
      src
      width
      height
    }
    alternatives {
      src
      width
      height
    }
  }
  followers(last: 5) {
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
    }
  }
  createdAt
  nsfw
}
    `;
export const AkashaAppFragmentDoc = /*#__PURE__*/ gql`
    fragment AkashaAppFragment on AkashaApp {
  id
  applicationType
  description
  license
  name
  displayName
  keywords
  createdAt
  releases(first: 5, sorting: {createdAt: DESC}) {
    edges {
      node {
        id
        createdAt
        source
        version
        meta {
          property
          provider
          value
        }
      }
      cursor
    }
  }
  releasesCount
  author {
    id
    isViewer
    akashaProfile {
      ...UserProfileFragment
    }
  }
  logoImage {
    height
    width
    src
  }
  coverImage {
    height
    width
    src
  }
  gallery {
    height
    width
    src
  }
  links {
    href
    label
  }
  contributors {
    id
    isViewer
    akashaProfile {
      ...UserProfileFragment
    }
  }
  meta {
    property
    provider
    value
  }
}
    `;
export const AppReleaseFragmentDoc = /*#__PURE__*/ gql`
    fragment AppReleaseFragment on AkashaAppRelease {
  application {
    ...AkashaAppFragment
  }
  applicationID
  id
  source
  version
  createdAt
  meta {
    provider
    property
    value
  }
}
    `;
export const IndexBeamDocument = /*#__PURE__*/ gql`
    mutation IndexBeam($jws: DID_JWS, $capability: CACAO_CAPABILITY) {
  indexBeam(jws: $jws, capability: $capability) {
    document {
      ...IndexedBeamFragment
    }
  }
}
    ${IndexedBeamFragmentDoc}`;
export const IndexContentBlockDocument = /*#__PURE__*/ gql`
    mutation IndexContentBlock($jws: DID_JWS, $capability: CACAO_CAPABILITY) {
  indexContentBlock(jws: $jws, capability: $capability) {
    document {
      ...IndexedContentBlockFragment
    }
  }
}
    ${IndexedContentBlockFragmentDoc}`;
export const CreateBeamDocument = /*#__PURE__*/ gql`
    mutation CreateBeam($i: CreateAkashaBeamInput!) {
  createAkashaBeam(input: $i) {
    document {
      ...BeamFragmentM
    }
    clientMutationId
  }
}
    ${BeamFragmentMFragmentDoc}`;
export const UpdateBeamDocument = /*#__PURE__*/ gql`
    mutation UpdateBeam($i: UpdateAkashaBeamInput!) {
  updateAkashaBeam(input: $i) {
    document {
      ...BeamFragmentM
    }
    clientMutationId
  }
}
    ${BeamFragmentMFragmentDoc}`;
export const CreateContentBlockDocument = /*#__PURE__*/ gql`
    mutation CreateContentBlock($i: CreateAkashaContentBlockInput!) {
  createAkashaContentBlock(input: $i) {
    document {
      ...ContentBlockFragmentM
    }
    clientMutationId
  }
}
    ${ContentBlockFragmentMFragmentDoc}`;
export const UpdateContentBlockDocument = /*#__PURE__*/ gql`
    mutation UpdateContentBlock($i: UpdateAkashaContentBlockInput!) {
  updateAkashaContentBlock(input: $i) {
    document {
      ...ContentBlockFragmentM
    }
    clientMutationId
  }
}
    ${ContentBlockFragmentMFragmentDoc}`;
export const GetBeamStreamDocument = /*#__PURE__*/ gql`
    query GetBeamStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaBeamStreamFiltersInput, $sorting: AkashaBeamStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaBeamStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            beamID
            createdAt
            active
            status
            moderationID
            appID
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
      isViewer
    }
  }
}
    `;
export const GetBeamsDocument = /*#__PURE__*/ gql`
    query GetBeams($after: String, $before: String, $first: Int, $last: Int, $filters: AkashaBeamFiltersInput, $sorting: AkashaBeamSortingInput) {
  akashaBeamIndex(
    after: $after
    before: $before
    first: $first
    last: $last
    filters: $filters
    sorting: $sorting
  ) {
    edges {
      node {
        ...BeamFragment
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${BeamFragmentDoc}`;
export const GetBeamsByAuthorDidDocument = /*#__PURE__*/ gql`
    query GetBeamsByAuthorDid($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaBeamFiltersInput, $sorting: AkashaBeamSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaBeamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            ...BeamFragment
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      akashaBeamListCount(filters: $filters)
      isViewer
    }
  }
}
    ${BeamFragmentDoc}`;
export const GetBeamByIdDocument = /*#__PURE__*/ gql`
    query GetBeamById($id: ID!) {
  node(id: $id) {
    ... on AkashaBeam {
      ...BeamFragment
    }
  }
}
    ${BeamFragmentDoc}`;
export const GetContentBlockStreamDocument = /*#__PURE__*/ gql`
    query GetContentBlockStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaContentBlockStreamFiltersInput, $sorting: AkashaContentBlockStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaContentBlockStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            createdAt
            active
            status
            blockID
            moderationID
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
      akashaContentBlockStreamListCount(filters: $filters)
      isViewer
    }
  }
}
    `;
export const GetContentBlockByIdDocument = /*#__PURE__*/ gql`
    query GetContentBlockById($id: ID!) {
  node(id: $id) {
    ... on AkashaContentBlock {
      ...ContentBlockFragment
    }
  }
}
    ${ContentBlockFragmentDoc}`;
export const GetBlockStorageByIdDocument = /*#__PURE__*/ gql`
    query GetBlockStorageById($id: ID!) {
  node(id: $id) {
    ... on AkashaBlockStorage {
      ...BlockStorageFragment
    }
  }
}
    ${BlockStorageFragmentDoc}`;
export const GetIndexedStreamDocument = /*#__PURE__*/ gql`
    query GetIndexedStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaIndexedStreamFiltersInput, $sorting: AkashaIndexedStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaIndexedStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            createdAt
            active
            status
            indexValue
            indexType
            stream
            streamType
            moderationID
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
      }
      akashaIndexedStreamListCount(filters: $filters)
      isViewer
    }
  }
}
    `;
export const GetIndexedStreamCountDocument = /*#__PURE__*/ gql`
    query GetIndexedStreamCount($indexer: ID!, $filters: AkashaIndexedStreamFiltersInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaIndexedStreamListCount(filters: $filters)
      isViewer
    }
  }
}
    `;
export const IndexReflectionDocument = /*#__PURE__*/ gql`
    mutation IndexReflection($jws: DID_JWS, $capability: CACAO_CAPABILITY) {
  indexReflection(jws: $jws, capability: $capability) {
    document {
      ...IndexedReflectFragment
    }
  }
}
    ${IndexedReflectFragmentDoc}`;
export const CreateReflectDocument = /*#__PURE__*/ gql`
    mutation CreateReflect($i: CreateAkashaReflectInput!) {
  createAkashaReflect(input: $i) {
    document {
      ...ReflectFragmentM
    }
    clientMutationId
  }
}
    ${ReflectFragmentMFragmentDoc}`;
export const UpdateAkashaReflectDocument = /*#__PURE__*/ gql`
    mutation UpdateAkashaReflect($i: UpdateAkashaReflectInput!) {
  updateAkashaReflect(input: $i) {
    document {
      ...ReflectFragmentM
    }
    clientMutationId
  }
}
    ${ReflectFragmentMFragmentDoc}`;
export const GetReflectionsFromBeamDocument = /*#__PURE__*/ gql`
    query GetReflectionsFromBeam($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaReflectInterfaceSortingInput, $filters: AkashaReflectInterfaceFiltersInput) {
  node(id: $id) {
    ... on AkashaBeam {
      reflections(
        after: $after
        before: $before
        first: $first
        last: $last
        sorting: $sorting
        filters: $filters
      ) {
        edges {
          node {
            ...ReflectFragment
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      reflectionsCount(filters: $filters)
    }
  }
}
    ${ReflectFragmentDoc}`;
export const GetReflectionsByAuthorDidDocument = /*#__PURE__*/ gql`
    query GetReflectionsByAuthorDid($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaReflectFiltersInput, $sorting: AkashaReflectSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaReflectList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            ...ReflectFragment
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      isViewer
    }
  }
}
    ${ReflectFragmentDoc}`;
export const GetReflectionStreamDocument = /*#__PURE__*/ gql`
    query GetReflectionStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaReflectStreamFiltersInput, $sorting: AkashaReflectStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaReflectStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            reflectionID
            moderationID
            beamID
            active
            status
            createdAt
            isReply
            replyTo
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      isViewer
    }
  }
}
    `;
export const GetReflectionByIdDocument = /*#__PURE__*/ gql`
    query GetReflectionById($id: ID!) {
  node(id: $id) {
    ... on AkashaReflect {
      ...ReflectFragment
    }
  }
}
    ${ReflectFragmentDoc}`;
export const GetReflectReflectionsDocument = /*#__PURE__*/ gql`
    query GetReflectReflections($id: String!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaReflectSortingInput) {
  akashaReflectIndex(
    after: $after
    before: $before
    first: $first
    last: $last
    filters: {and: [{where: {reflection: {equalTo: $id}}}, {where: {active: {equalTo: true}}}]}
    sorting: $sorting
  ) {
    edges {
      node {
        ...ReflectFragment
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${ReflectFragmentDoc}`;
export const IndexProfileDocument = /*#__PURE__*/ gql`
    mutation IndexProfile($jws: DID_JWS, $capability: CACAO_CAPABILITY) {
  indexProfile(jws: $jws, capability: $capability) {
    document {
      ...IndexedProfileFragment
    }
  }
}
    ${IndexedProfileFragmentDoc}`;
export const CreateProfileDocument = /*#__PURE__*/ gql`
    mutation CreateProfile($i: SetAkashaProfileInput!) {
  setAkashaProfile(input: $i) {
    document {
      ...UserProfileFragmentM
    }
    clientMutationId
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const UpdateProfileDocument = /*#__PURE__*/ gql`
    mutation UpdateProfile($i: UpdateAkashaProfileInput!) {
  updateAkashaProfile(input: $i) {
    document {
      ...UserProfileFragmentM
    }
    clientMutationId
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const CreateInterestsDocument = /*#__PURE__*/ gql`
    mutation CreateInterests($i: SetAkashaProfileInterestsInput!) {
  setAkashaProfileInterests(input: $i) {
    document {
      topics {
        value
        labelType
      }
      did {
        id
      }
      id
    }
    clientMutationId
  }
}
    `;
export const UpdateInterestsDocument = /*#__PURE__*/ gql`
    mutation UpdateInterests($i: UpdateAkashaProfileInterestsInput!) {
  updateAkashaProfileInterests(input: $i) {
    document {
      topics {
        value
        labelType
      }
      did {
        id
      }
      id
    }
    clientMutationId
  }
}
    `;
export const CreateFollowDocument = /*#__PURE__*/ gql`
    mutation CreateFollow($i: SetAkashaFollowInput!) {
  setAkashaFollow(input: $i) {
    document {
      isFollowing
      profile {
        ...UserProfileFragmentM
      }
      did {
        id
      }
      id
    }
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const UpdateFollowDocument = /*#__PURE__*/ gql`
    mutation UpdateFollow($i: UpdateAkashaFollowInput!) {
  updateAkashaFollow(input: $i) {
    document {
      isFollowing
      profile {
        ...UserProfileFragmentM
      }
      did {
        id
      }
      id
    }
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const GetMyProfileDocument = /*#__PURE__*/ gql`
    query GetMyProfile {
  viewer {
    akashaProfile {
      ...UserProfileFragmentM
    }
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const GetFollowDocumentsByDidDocument = /*#__PURE__*/ gql`
    query GetFollowDocumentsByDid($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaFollowSortingInput, $following: [String!]) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaFollowList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: {where: {profileID: {in: $following}}}
        sorting: $sorting
      ) {
        edges {
          node {
            id
            isFollowing
            profileID
            profile {
              ...UserProfileFragmentM
            }
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      isViewer
    }
  }
}
    ${UserProfileFragmentMFragmentDoc}`;
export const GetProfileByIdDocument = /*#__PURE__*/ gql`
    query GetProfileByID($id: ID!) {
  node(id: $id) {
    ... on AkashaProfile {
      ...UserProfileFragment
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const GetProfileByDidDocument = /*#__PURE__*/ gql`
    query GetProfileByDid($id: ID!) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaProfile {
        ...UserProfileFragment
      }
      isViewer
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const GetProfilesDocument = /*#__PURE__*/ gql`
    query GetProfiles($after: String, $before: String, $first: Int, $last: Int, $filters: AkashaProfileFiltersInput, $sorting: AkashaProfileSortingInput) {
  akashaProfileIndex(
    after: $after
    before: $before
    first: $first
    last: $last
    filters: $filters
    sorting: $sorting
  ) {
    edges {
      node {
        ...UserProfileFragment
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const GetProfileStreamDocument = /*#__PURE__*/ gql`
    query GetProfileStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaProfileStreamFiltersInput, $sorting: AkashaProfileStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaProfileStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            profileID
            active
            createdAt
            moderationID
            status
            appID
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}
    `;
export const GetInterestsDocument = /*#__PURE__*/ gql`
    query GetInterests($after: String, $before: String, $first: Int, $last: Int) {
  akashaProfileInterestsIndex(
    after: $after
    before: $before
    first: $first
    last: $last
  ) {
    edges {
      node {
        topics {
          value
          labelType
        }
        did {
          id
        }
        id
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;
export const GetInterestsStreamDocument = /*#__PURE__*/ gql`
    query GetInterestsStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaInterestsStreamSortingInput, $filters: AkashaInterestsStreamFiltersInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaInterestsStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        sorting: $sorting
        filters: $filters
      ) {
        edges {
          node {
            labelType
            value
            active
            createdAt
            id
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}
    `;
export const GetInterestsByDidDocument = /*#__PURE__*/ gql`
    query GetInterestsByDid($id: ID!) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaProfileInterests {
        topics {
          value
          labelType
        }
        did {
          id
        }
        id
      }
      isViewer
    }
  }
}
    `;
export const GetInterestsByIdDocument = /*#__PURE__*/ gql`
    query GetInterestsById($id: ID!) {
  node(id: $id) {
    ... on AkashaProfileInterests {
      topics {
        value
        labelType
      }
      did {
        id
      }
      id
    }
  }
}
    `;
export const GetFollowingListByDidDocument = /*#__PURE__*/ gql`
    query GetFollowingListByDid($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaFollowSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaFollowList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: {where: {isFollowing: {equalTo: true}}}
        sorting: $sorting
      ) {
        edges {
          node {
            id
            isFollowing
            profileID
            profile {
              ...UserProfileFragment
            }
            did {
              id
            }
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
      isViewer
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const GetFollowersListByDidDocument = /*#__PURE__*/ gql`
    query GetFollowersListByDid($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $sorting: AkashaFollowInterfaceSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaProfile {
        followers(
          after: $after
          before: $before
          first: $first
          last: $last
          filters: {where: {isFollowing: {equalTo: true}}}
          sorting: $sorting
        ) {
          edges {
            node {
              id
              isFollowing
              profileID
              profile {
                ...UserProfileFragment
              }
              did {
                akashaProfile {
                  ...UserProfileFragment
                }
              }
            }
            cursor
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }
      isViewer
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const GetProfileStatsByDidDocument = /*#__PURE__*/ gql`
    query GetProfileStatsByDid($id: ID!) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaFollowListCount(filters: {where: {isFollowing: {equalTo: true}}})
      akashaBeamListCount(filters: {where: {active: {equalTo: true}}})
      akashaReflectListCount(filters: {where: {active: {equalTo: true}}})
      akashaProfile {
        ...UserProfileFragment
        followersCount(filters: {where: {isFollowing: {equalTo: true}}})
      }
      isViewer
    }
  }
}
    ${UserProfileFragmentDoc}`;
export const SetAppReleaseDocument = /*#__PURE__*/ gql`
    mutation SetAppRelease($i: SetAkashaAppReleaseInput!) {
  setAkashaAppRelease(input: $i) {
    document {
      ...AppReleaseFragmentM
    }
    clientMutationId
  }
}
    ${AppReleaseFragmentMFragmentDoc}
${AkashaAppFragmentMFragmentDoc}
${UserProfileFragmentMFragmentDoc}`;
export const UpdateAppReleaseDocument = /*#__PURE__*/ gql`
    mutation UpdateAppRelease($i: UpdateAkashaAppReleaseInput!) {
  updateAkashaAppRelease(input: $i) {
    document {
      ...AppReleaseFragmentM
    }
    clientMutationId
  }
}
    ${AppReleaseFragmentMFragmentDoc}
${AkashaAppFragmentMFragmentDoc}
${UserProfileFragmentMFragmentDoc}`;
export const CreateAppDocument = /*#__PURE__*/ gql`
    mutation CreateApp($i: SetAkashaAppInput!) {
  setAkashaApp(input: $i) {
    document {
      ...AkashaAppFragmentM
    }
    clientMutationId
  }
}
    ${AkashaAppFragmentMFragmentDoc}
${UserProfileFragmentMFragmentDoc}`;
export const UpdateAppDocument = /*#__PURE__*/ gql`
    mutation UpdateApp($i: UpdateAkashaAppInput!) {
  updateAkashaApp(input: $i) {
    document {
      ...AkashaAppFragmentM
    }
    clientMutationId
  }
}
    ${AkashaAppFragmentMFragmentDoc}
${UserProfileFragmentMFragmentDoc}`;
export const GetAppsDocument = /*#__PURE__*/ gql`
    query GetApps($after: String, $before: String, $first: Int, $last: Int, $filters: AkashaAppFiltersInput, $sorting: AkashaAppSortingInput) {
  akashaAppIndex(
    after: $after
    before: $before
    first: $first
    last: $last
    filters: $filters
    sorting: $sorting
  ) {
    edges {
      node {
        ...AkashaAppFragment
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export const GetAppsStreamDocument = /*#__PURE__*/ gql`
    query GetAppsStream($indexer: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaAppsStreamFiltersInput, $sorting: AkashaAppsStreamSortingInput) {
  node(id: $indexer) {
    ... on CeramicAccount {
      akashaAppsStreamList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            moderationID
            active
            applicationID
            status
            createdAt
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}
    `;
export const GetAppsByIdDocument = /*#__PURE__*/ gql`
    query GetAppsByID($id: ID!) {
  node(id: $id) {
    ... on AkashaApp {
      ...AkashaAppFragment
    }
  }
}
    ${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export const GetAppsByPublisherDidDocument = /*#__PURE__*/ gql`
    query GetAppsByPublisherDID($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaAppFiltersInput, $sorting: AkashaAppSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaAppList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            ...AkashaAppFragment
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}
    ${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export const GetAppsReleasesByPublisherDidDocument = /*#__PURE__*/ gql`
    query GetAppsReleasesByPublisherDID($id: ID!, $after: String, $before: String, $first: Int, $last: Int, $filters: AkashaAppReleaseFiltersInput, $sorting: AkashaAppReleaseSortingInput) {
  node(id: $id) {
    ... on CeramicAccount {
      akashaAppReleaseList(
        after: $after
        before: $before
        first: $first
        last: $last
        filters: $filters
        sorting: $sorting
      ) {
        edges {
          node {
            ...AppReleaseFragment
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}
    ${AppReleaseFragmentDoc}
${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export const GetAppsReleasesDocument = /*#__PURE__*/ gql`
    query GetAppsReleases($after: String, $before: String, $first: Int, $last: Int, $filters: AkashaAppReleaseFiltersInput, $sorting: AkashaAppReleaseSortingInput) {
  akashaAppReleaseIndex(
    after: $after
    before: $before
    first: $first
    last: $last
    filters: $filters
    sorting: $sorting
  ) {
    edges {
      node {
        ...AppReleaseFragment
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${AppReleaseFragmentDoc}
${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export const GetAppReleaseByIdDocument = /*#__PURE__*/ gql`
    query GetAppReleaseByID($id: ID!) {
  node(id: $id) {
    ... on AkashaAppRelease {
      ...AppReleaseFragment
    }
  }
}
    ${AppReleaseFragmentDoc}
${AkashaAppFragmentDoc}
${UserProfileFragmentDoc}`;
export type Requester<C = {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    IndexBeam(variables?: Types.IndexBeamMutationVariables, options?: C): Promise<Types.IndexBeamMutation> {
      return requester<Types.IndexBeamMutation, Types.IndexBeamMutationVariables>(IndexBeamDocument, variables, options) as Promise<Types.IndexBeamMutation>;
    },
    IndexContentBlock(variables?: Types.IndexContentBlockMutationVariables, options?: C): Promise<Types.IndexContentBlockMutation> {
      return requester<Types.IndexContentBlockMutation, Types.IndexContentBlockMutationVariables>(IndexContentBlockDocument, variables, options) as Promise<Types.IndexContentBlockMutation>;
    },
    CreateBeam(variables: Types.CreateBeamMutationVariables, options?: C): Promise<Types.CreateBeamMutation> {
      return requester<Types.CreateBeamMutation, Types.CreateBeamMutationVariables>(CreateBeamDocument, variables, options) as Promise<Types.CreateBeamMutation>;
    },
    UpdateBeam(variables: Types.UpdateBeamMutationVariables, options?: C): Promise<Types.UpdateBeamMutation> {
      return requester<Types.UpdateBeamMutation, Types.UpdateBeamMutationVariables>(UpdateBeamDocument, variables, options) as Promise<Types.UpdateBeamMutation>;
    },
    CreateContentBlock(variables: Types.CreateContentBlockMutationVariables, options?: C): Promise<Types.CreateContentBlockMutation> {
      return requester<Types.CreateContentBlockMutation, Types.CreateContentBlockMutationVariables>(CreateContentBlockDocument, variables, options) as Promise<Types.CreateContentBlockMutation>;
    },
    UpdateContentBlock(variables: Types.UpdateContentBlockMutationVariables, options?: C): Promise<Types.UpdateContentBlockMutation> {
      return requester<Types.UpdateContentBlockMutation, Types.UpdateContentBlockMutationVariables>(UpdateContentBlockDocument, variables, options) as Promise<Types.UpdateContentBlockMutation>;
    },
    GetBeamStream(variables: Types.GetBeamStreamQueryVariables, options?: C): Promise<Types.GetBeamStreamQuery> {
      return requester<Types.GetBeamStreamQuery, Types.GetBeamStreamQueryVariables>(GetBeamStreamDocument, variables, options) as Promise<Types.GetBeamStreamQuery>;
    },
    GetBeams(variables?: Types.GetBeamsQueryVariables, options?: C): Promise<Types.GetBeamsQuery> {
      return requester<Types.GetBeamsQuery, Types.GetBeamsQueryVariables>(GetBeamsDocument, variables, options) as Promise<Types.GetBeamsQuery>;
    },
    GetBeamsByAuthorDid(variables: Types.GetBeamsByAuthorDidQueryVariables, options?: C): Promise<Types.GetBeamsByAuthorDidQuery> {
      return requester<Types.GetBeamsByAuthorDidQuery, Types.GetBeamsByAuthorDidQueryVariables>(GetBeamsByAuthorDidDocument, variables, options) as Promise<Types.GetBeamsByAuthorDidQuery>;
    },
    GetBeamById(variables: Types.GetBeamByIdQueryVariables, options?: C): Promise<Types.GetBeamByIdQuery> {
      return requester<Types.GetBeamByIdQuery, Types.GetBeamByIdQueryVariables>(GetBeamByIdDocument, variables, options) as Promise<Types.GetBeamByIdQuery>;
    },
    GetContentBlockStream(variables: Types.GetContentBlockStreamQueryVariables, options?: C): Promise<Types.GetContentBlockStreamQuery> {
      return requester<Types.GetContentBlockStreamQuery, Types.GetContentBlockStreamQueryVariables>(GetContentBlockStreamDocument, variables, options) as Promise<Types.GetContentBlockStreamQuery>;
    },
    GetContentBlockById(variables: Types.GetContentBlockByIdQueryVariables, options?: C): Promise<Types.GetContentBlockByIdQuery> {
      return requester<Types.GetContentBlockByIdQuery, Types.GetContentBlockByIdQueryVariables>(GetContentBlockByIdDocument, variables, options) as Promise<Types.GetContentBlockByIdQuery>;
    },
    GetBlockStorageById(variables: Types.GetBlockStorageByIdQueryVariables, options?: C): Promise<Types.GetBlockStorageByIdQuery> {
      return requester<Types.GetBlockStorageByIdQuery, Types.GetBlockStorageByIdQueryVariables>(GetBlockStorageByIdDocument, variables, options) as Promise<Types.GetBlockStorageByIdQuery>;
    },
    GetIndexedStream(variables: Types.GetIndexedStreamQueryVariables, options?: C): Promise<Types.GetIndexedStreamQuery> {
      return requester<Types.GetIndexedStreamQuery, Types.GetIndexedStreamQueryVariables>(GetIndexedStreamDocument, variables, options) as Promise<Types.GetIndexedStreamQuery>;
    },
    GetIndexedStreamCount(variables: Types.GetIndexedStreamCountQueryVariables, options?: C): Promise<Types.GetIndexedStreamCountQuery> {
      return requester<Types.GetIndexedStreamCountQuery, Types.GetIndexedStreamCountQueryVariables>(GetIndexedStreamCountDocument, variables, options) as Promise<Types.GetIndexedStreamCountQuery>;
    },
    IndexReflection(variables?: Types.IndexReflectionMutationVariables, options?: C): Promise<Types.IndexReflectionMutation> {
      return requester<Types.IndexReflectionMutation, Types.IndexReflectionMutationVariables>(IndexReflectionDocument, variables, options) as Promise<Types.IndexReflectionMutation>;
    },
    CreateReflect(variables: Types.CreateReflectMutationVariables, options?: C): Promise<Types.CreateReflectMutation> {
      return requester<Types.CreateReflectMutation, Types.CreateReflectMutationVariables>(CreateReflectDocument, variables, options) as Promise<Types.CreateReflectMutation>;
    },
    UpdateAkashaReflect(variables: Types.UpdateAkashaReflectMutationVariables, options?: C): Promise<Types.UpdateAkashaReflectMutation> {
      return requester<Types.UpdateAkashaReflectMutation, Types.UpdateAkashaReflectMutationVariables>(UpdateAkashaReflectDocument, variables, options) as Promise<Types.UpdateAkashaReflectMutation>;
    },
    GetReflectionsFromBeam(variables: Types.GetReflectionsFromBeamQueryVariables, options?: C): Promise<Types.GetReflectionsFromBeamQuery> {
      return requester<Types.GetReflectionsFromBeamQuery, Types.GetReflectionsFromBeamQueryVariables>(GetReflectionsFromBeamDocument, variables, options) as Promise<Types.GetReflectionsFromBeamQuery>;
    },
    GetReflectionsByAuthorDid(variables: Types.GetReflectionsByAuthorDidQueryVariables, options?: C): Promise<Types.GetReflectionsByAuthorDidQuery> {
      return requester<Types.GetReflectionsByAuthorDidQuery, Types.GetReflectionsByAuthorDidQueryVariables>(GetReflectionsByAuthorDidDocument, variables, options) as Promise<Types.GetReflectionsByAuthorDidQuery>;
    },
    GetReflectionStream(variables: Types.GetReflectionStreamQueryVariables, options?: C): Promise<Types.GetReflectionStreamQuery> {
      return requester<Types.GetReflectionStreamQuery, Types.GetReflectionStreamQueryVariables>(GetReflectionStreamDocument, variables, options) as Promise<Types.GetReflectionStreamQuery>;
    },
    GetReflectionById(variables: Types.GetReflectionByIdQueryVariables, options?: C): Promise<Types.GetReflectionByIdQuery> {
      return requester<Types.GetReflectionByIdQuery, Types.GetReflectionByIdQueryVariables>(GetReflectionByIdDocument, variables, options) as Promise<Types.GetReflectionByIdQuery>;
    },
    GetReflectReflections(variables: Types.GetReflectReflectionsQueryVariables, options?: C): Promise<Types.GetReflectReflectionsQuery> {
      return requester<Types.GetReflectReflectionsQuery, Types.GetReflectReflectionsQueryVariables>(GetReflectReflectionsDocument, variables, options) as Promise<Types.GetReflectReflectionsQuery>;
    },
    IndexProfile(variables?: Types.IndexProfileMutationVariables, options?: C): Promise<Types.IndexProfileMutation> {
      return requester<Types.IndexProfileMutation, Types.IndexProfileMutationVariables>(IndexProfileDocument, variables, options) as Promise<Types.IndexProfileMutation>;
    },
    CreateProfile(variables: Types.CreateProfileMutationVariables, options?: C): Promise<Types.CreateProfileMutation> {
      return requester<Types.CreateProfileMutation, Types.CreateProfileMutationVariables>(CreateProfileDocument, variables, options) as Promise<Types.CreateProfileMutation>;
    },
    UpdateProfile(variables: Types.UpdateProfileMutationVariables, options?: C): Promise<Types.UpdateProfileMutation> {
      return requester<Types.UpdateProfileMutation, Types.UpdateProfileMutationVariables>(UpdateProfileDocument, variables, options) as Promise<Types.UpdateProfileMutation>;
    },
    CreateInterests(variables: Types.CreateInterestsMutationVariables, options?: C): Promise<Types.CreateInterestsMutation> {
      return requester<Types.CreateInterestsMutation, Types.CreateInterestsMutationVariables>(CreateInterestsDocument, variables, options) as Promise<Types.CreateInterestsMutation>;
    },
    UpdateInterests(variables: Types.UpdateInterestsMutationVariables, options?: C): Promise<Types.UpdateInterestsMutation> {
      return requester<Types.UpdateInterestsMutation, Types.UpdateInterestsMutationVariables>(UpdateInterestsDocument, variables, options) as Promise<Types.UpdateInterestsMutation>;
    },
    CreateFollow(variables: Types.CreateFollowMutationVariables, options?: C): Promise<Types.CreateFollowMutation> {
      return requester<Types.CreateFollowMutation, Types.CreateFollowMutationVariables>(CreateFollowDocument, variables, options) as Promise<Types.CreateFollowMutation>;
    },
    UpdateFollow(variables: Types.UpdateFollowMutationVariables, options?: C): Promise<Types.UpdateFollowMutation> {
      return requester<Types.UpdateFollowMutation, Types.UpdateFollowMutationVariables>(UpdateFollowDocument, variables, options) as Promise<Types.UpdateFollowMutation>;
    },
    GetMyProfile(variables?: Types.GetMyProfileQueryVariables, options?: C): Promise<Types.GetMyProfileQuery> {
      return requester<Types.GetMyProfileQuery, Types.GetMyProfileQueryVariables>(GetMyProfileDocument, variables, options) as Promise<Types.GetMyProfileQuery>;
    },
    GetFollowDocumentsByDid(variables: Types.GetFollowDocumentsByDidQueryVariables, options?: C): Promise<Types.GetFollowDocumentsByDidQuery> {
      return requester<Types.GetFollowDocumentsByDidQuery, Types.GetFollowDocumentsByDidQueryVariables>(GetFollowDocumentsByDidDocument, variables, options) as Promise<Types.GetFollowDocumentsByDidQuery>;
    },
    GetProfileByID(variables: Types.GetProfileByIdQueryVariables, options?: C): Promise<Types.GetProfileByIdQuery> {
      return requester<Types.GetProfileByIdQuery, Types.GetProfileByIdQueryVariables>(GetProfileByIdDocument, variables, options) as Promise<Types.GetProfileByIdQuery>;
    },
    GetProfileByDid(variables: Types.GetProfileByDidQueryVariables, options?: C): Promise<Types.GetProfileByDidQuery> {
      return requester<Types.GetProfileByDidQuery, Types.GetProfileByDidQueryVariables>(GetProfileByDidDocument, variables, options) as Promise<Types.GetProfileByDidQuery>;
    },
    GetProfiles(variables?: Types.GetProfilesQueryVariables, options?: C): Promise<Types.GetProfilesQuery> {
      return requester<Types.GetProfilesQuery, Types.GetProfilesQueryVariables>(GetProfilesDocument, variables, options) as Promise<Types.GetProfilesQuery>;
    },
    GetProfileStream(variables: Types.GetProfileStreamQueryVariables, options?: C): Promise<Types.GetProfileStreamQuery> {
      return requester<Types.GetProfileStreamQuery, Types.GetProfileStreamQueryVariables>(GetProfileStreamDocument, variables, options) as Promise<Types.GetProfileStreamQuery>;
    },
    GetInterests(variables?: Types.GetInterestsQueryVariables, options?: C): Promise<Types.GetInterestsQuery> {
      return requester<Types.GetInterestsQuery, Types.GetInterestsQueryVariables>(GetInterestsDocument, variables, options) as Promise<Types.GetInterestsQuery>;
    },
    GetInterestsStream(variables: Types.GetInterestsStreamQueryVariables, options?: C): Promise<Types.GetInterestsStreamQuery> {
      return requester<Types.GetInterestsStreamQuery, Types.GetInterestsStreamQueryVariables>(GetInterestsStreamDocument, variables, options) as Promise<Types.GetInterestsStreamQuery>;
    },
    GetInterestsByDid(variables: Types.GetInterestsByDidQueryVariables, options?: C): Promise<Types.GetInterestsByDidQuery> {
      return requester<Types.GetInterestsByDidQuery, Types.GetInterestsByDidQueryVariables>(GetInterestsByDidDocument, variables, options) as Promise<Types.GetInterestsByDidQuery>;
    },
    GetInterestsById(variables: Types.GetInterestsByIdQueryVariables, options?: C): Promise<Types.GetInterestsByIdQuery> {
      return requester<Types.GetInterestsByIdQuery, Types.GetInterestsByIdQueryVariables>(GetInterestsByIdDocument, variables, options) as Promise<Types.GetInterestsByIdQuery>;
    },
    GetFollowingListByDid(variables: Types.GetFollowingListByDidQueryVariables, options?: C): Promise<Types.GetFollowingListByDidQuery> {
      return requester<Types.GetFollowingListByDidQuery, Types.GetFollowingListByDidQueryVariables>(GetFollowingListByDidDocument, variables, options) as Promise<Types.GetFollowingListByDidQuery>;
    },
    GetFollowersListByDid(variables: Types.GetFollowersListByDidQueryVariables, options?: C): Promise<Types.GetFollowersListByDidQuery> {
      return requester<Types.GetFollowersListByDidQuery, Types.GetFollowersListByDidQueryVariables>(GetFollowersListByDidDocument, variables, options) as Promise<Types.GetFollowersListByDidQuery>;
    },
    GetProfileStatsByDid(variables: Types.GetProfileStatsByDidQueryVariables, options?: C): Promise<Types.GetProfileStatsByDidQuery> {
      return requester<Types.GetProfileStatsByDidQuery, Types.GetProfileStatsByDidQueryVariables>(GetProfileStatsByDidDocument, variables, options) as Promise<Types.GetProfileStatsByDidQuery>;
    },
    SetAppRelease(variables: Types.SetAppReleaseMutationVariables, options?: C): Promise<Types.SetAppReleaseMutation> {
      return requester<Types.SetAppReleaseMutation, Types.SetAppReleaseMutationVariables>(SetAppReleaseDocument, variables, options) as Promise<Types.SetAppReleaseMutation>;
    },
    UpdateAppRelease(variables: Types.UpdateAppReleaseMutationVariables, options?: C): Promise<Types.UpdateAppReleaseMutation> {
      return requester<Types.UpdateAppReleaseMutation, Types.UpdateAppReleaseMutationVariables>(UpdateAppReleaseDocument, variables, options) as Promise<Types.UpdateAppReleaseMutation>;
    },
    CreateApp(variables: Types.CreateAppMutationVariables, options?: C): Promise<Types.CreateAppMutation> {
      return requester<Types.CreateAppMutation, Types.CreateAppMutationVariables>(CreateAppDocument, variables, options) as Promise<Types.CreateAppMutation>;
    },
    UpdateApp(variables: Types.UpdateAppMutationVariables, options?: C): Promise<Types.UpdateAppMutation> {
      return requester<Types.UpdateAppMutation, Types.UpdateAppMutationVariables>(UpdateAppDocument, variables, options) as Promise<Types.UpdateAppMutation>;
    },
    GetApps(variables?: Types.GetAppsQueryVariables, options?: C): Promise<Types.GetAppsQuery> {
      return requester<Types.GetAppsQuery, Types.GetAppsQueryVariables>(GetAppsDocument, variables, options) as Promise<Types.GetAppsQuery>;
    },
    GetAppsStream(variables: Types.GetAppsStreamQueryVariables, options?: C): Promise<Types.GetAppsStreamQuery> {
      return requester<Types.GetAppsStreamQuery, Types.GetAppsStreamQueryVariables>(GetAppsStreamDocument, variables, options) as Promise<Types.GetAppsStreamQuery>;
    },
    GetAppsByID(variables: Types.GetAppsByIdQueryVariables, options?: C): Promise<Types.GetAppsByIdQuery> {
      return requester<Types.GetAppsByIdQuery, Types.GetAppsByIdQueryVariables>(GetAppsByIdDocument, variables, options) as Promise<Types.GetAppsByIdQuery>;
    },
    GetAppsByPublisherDID(variables: Types.GetAppsByPublisherDidQueryVariables, options?: C): Promise<Types.GetAppsByPublisherDidQuery> {
      return requester<Types.GetAppsByPublisherDidQuery, Types.GetAppsByPublisherDidQueryVariables>(GetAppsByPublisherDidDocument, variables, options) as Promise<Types.GetAppsByPublisherDidQuery>;
    },
    GetAppsReleasesByPublisherDID(variables: Types.GetAppsReleasesByPublisherDidQueryVariables, options?: C): Promise<Types.GetAppsReleasesByPublisherDidQuery> {
      return requester<Types.GetAppsReleasesByPublisherDidQuery, Types.GetAppsReleasesByPublisherDidQueryVariables>(GetAppsReleasesByPublisherDidDocument, variables, options) as Promise<Types.GetAppsReleasesByPublisherDidQuery>;
    },
    GetAppsReleases(variables?: Types.GetAppsReleasesQueryVariables, options?: C): Promise<Types.GetAppsReleasesQuery> {
      return requester<Types.GetAppsReleasesQuery, Types.GetAppsReleasesQueryVariables>(GetAppsReleasesDocument, variables, options) as Promise<Types.GetAppsReleasesQuery>;
    },
    GetAppReleaseByID(variables: Types.GetAppReleaseByIdQueryVariables, options?: C): Promise<Types.GetAppReleaseByIdQuery> {
      return requester<Types.GetAppReleaseByIdQuery, Types.GetAppReleaseByIdQueryVariables>(GetAppReleaseByIdDocument, variables, options) as Promise<Types.GetAppReleaseByIdQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;