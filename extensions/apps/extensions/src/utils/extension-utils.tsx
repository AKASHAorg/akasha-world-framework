import {
  AkashaAppApplicationType,
  AkashaAppsStreamModerationStatus,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ExtensionStatus } from '@akashaorg/typings/lib/ui';

export const getExtensionStatus = (
  isLocalDraft: boolean,
  streamModerationStatus: AkashaAppsStreamModerationStatus,
) => {
  if (isLocalDraft) {
    return ExtensionStatus.LocalDraft;
  }
  switch (streamModerationStatus) {
    case null:
      return ExtensionStatus.InReview;
    case AkashaAppsStreamModerationStatus.InReview:
      return ExtensionStatus.InReview;
    case AkashaAppsStreamModerationStatus.Ok:
      return ExtensionStatus.Published;
    default:
      return ExtensionStatus.InReview;
  }
};

export const getStatusIndicatorStyle = (
  isLocalDraft: boolean,
  streamModerationStatus: AkashaAppsStreamModerationStatus,
) => {
  switch (getExtensionStatus(isLocalDraft, streamModerationStatus)) {
    case ExtensionStatus.LocalDraft:
      return 'bg-grey6';
    case ExtensionStatus.Published:
      return 'bg-success';
    case ExtensionStatus.InReview:
      return 'bg-(warningLight dark:warningDark)';
    default:
      return 'bg-grey6';
  }
};

export const getExtensionTypeLabel = (applicationType: AkashaAppApplicationType) => {
  if (!applicationType) {
    return '';
  }
  switch (applicationType) {
    case AkashaAppApplicationType.App:
      return 'App';
    case AkashaAppApplicationType.Plugin:
      return 'Plugin';
    case AkashaAppApplicationType.Widget:
      return 'Widget';
    default:
      return 'Other';
  }
};
