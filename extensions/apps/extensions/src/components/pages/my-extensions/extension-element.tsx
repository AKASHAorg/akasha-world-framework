import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import getSDK from '@akashaorg/core-sdk';
import ExtensionIcon from '@akashaorg/design-system-core/lib/components/ExtensionIcon';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Menu from '@akashaorg/design-system-core/lib/components/Menu';
import {
  EyeIcon,
  PaperAirplaneIcon,
  PencilIcon,
  RectangleStackIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { MenuProps } from '@akashaorg/design-system-core/lib/components/Menu';
import { EllipsisHorizontalIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { hasOwn, transformSource, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useGetAppsStreamQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { ExtensionStatus } from '@akashaorg/typings/lib/ui';
import { getExtensionStatus, getStatusIndicatorStyle } from '../../../utils/extension-utils';
import {
  AkashaAppApplicationType,
  AppImageSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';

type ExtensionElement = {
  extensionId: string;
  extensionName?: string;
  extensionDisplayName?: string;
  extensionDescription?: string;
  extensionApplicationType?: AkashaAppApplicationType;
  extensionLogoImage?: AppImageSource;
  isExtensionLocalDraft?: boolean;
  showDivider?: boolean;
  filter?: string;
  filterShowAllOptionValue?: string;
  showMenu?: boolean;
};

export const ExtensionElement: React.FC<ExtensionElement> = ({
  extensionId,
  extensionName,
  extensionDisplayName,
  extensionDescription,
  extensionApplicationType,
  extensionLogoImage,
  isExtensionLocalDraft,
  showDivider = false,
  filter,
  filterShowAllOptionValue,
  showMenu = false,
}) => {
  const { t } = useTranslation('app-extensions');
  const sdk = React.useRef(getSDK());

  const { navigateToModal } = useRootComponentProps();

  const navigate = useNavigate();

  const { data: appStreamReq } = useGetAppsStreamQuery({
    variables: {
      indexer: sdk.current.services.gql.indexingDID,
      first: 1,
      filters: {
        where: {
          applicationID: {
            equalTo: extensionId,
          },
        },
      },
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    skip: !extensionId || !extensionId?.trim() || extensionId?.length < 10 || isExtensionLocalDraft,
  });

  const appStreamData =
    appStreamReq?.node && hasOwn(appStreamReq.node, 'akashaAppsStreamList')
      ? appStreamReq.node.akashaAppsStreamList
      : null;

  const handleExtensionRemove = () => {
    navigateToModal({
      name: `remove-extension-confirmation`,
      extensionId: extensionId,
    });
  };

  const handleEditLocalExtension = () => {
    navigate({
      to: `/edit-extension/$extensionId/step1`,
      params: { extensionId: extensionId },
    });
  };

  const handleEditPublishedExtension = () => {
    navigate({
      to: `/edit-published-extension/$extensionId/form`,
      params: { extensionId: extensionId },
    });
  };

  const handleNavigateToExtensionInfoPage = () => {
    navigate({
      to: `/info/$appId`,
      params: { appId: extensionName },
    });
  };

  const handleExtensionSubmit = () => {
    navigate({
      to: `/publish-extension/$extensionId`,
      params: { extensionId: extensionId },
    });
  };

  const handleReleaseManager = () => {
    navigate({
      to: `/release-manager/$extensionId`,
      params: { extensionId: extensionId },
    });
  };

  const menuItems = (extensionStatus: string): MenuProps['items'] | [] => {
    switch (extensionStatus) {
      case ExtensionStatus.InReview:
        return [
          {
            label: t('View Extension'),
            icon: <EyeIcon />,
            onClick: handleNavigateToExtensionInfoPage,
          },
          {
            label: t('Edit Extension'),
            icon: <PencilIcon />,
            onClick: handleEditPublishedExtension,
          },
          {
            label: t('Release Manager'),
            icon: <RectangleStackIcon />,
            onClick: handleReleaseManager,
          },
          {
            label: t('Delete Extension'),
            icon: <TrashIcon />,
            onClick: handleExtensionRemove,
            color: { light: 'errorLight', dark: 'errorDark' },
          },
        ];
      case ExtensionStatus.Published:
        return [
          {
            label: t('View Extension'),
            icon: <EyeIcon />,
            onClick: handleNavigateToExtensionInfoPage,
          },
          {
            label: t('Edit Extension'),
            icon: <PencilIcon />,
            onClick: handleEditPublishedExtension,
          },
          {
            label: t('Release Manager'),
            icon: <RectangleStackIcon />,
            onClick: handleReleaseManager,
          },
          {
            label: t('Delete Extension'),
            icon: <TrashIcon />,
            onClick: handleExtensionRemove,
            color: { light: 'errorLight', dark: 'errorDark' },
          },
        ];
      case ExtensionStatus.LocalDraft:
        return [
          {
            label: t('Publish Extension'),
            icon: <PaperAirplaneIcon />,
            onClick: handleExtensionSubmit,
          },
          {
            label: t('Edit Extension'),
            icon: <PencilIcon />,
            onClick: handleEditLocalExtension,
          },
          {
            label: t('Release Manager'),
            icon: <RectangleStackIcon />,
            onClick: handleReleaseManager,
          },
          {
            label: t('Delete Extension'),
            icon: <TrashIcon />,
            onClick: handleExtensionRemove,
            color: { light: 'errorLight', dark: 'errorDark' },
          },
        ];
      default:
        return [];
    }
  };

  const showElement = () => {
    if (!filter) {
      return true;
    } else if (filter) {
      if (filter === filterShowAllOptionValue) {
        return true;
      }
      return (
        filter === getExtensionStatus(isExtensionLocalDraft, appStreamData?.edges[0]?.node?.status)
      );
    }
  };

  const iconType = useMemo(() => extensionApplicationType, [extensionApplicationType]);

  if (!showElement()) return null;

  return (
    <Stack spacing="gap-y-4">
      <Stack direction="row" justify="between" spacing="gap-x-8" fullWidth>
        <Stack direction="row" spacing="gap-x-3" customStyle="max-h-[60px] w-[60%]">
          <AppAvatar
            appType={extensionApplicationType}
            avatar={transformSource(extensionLogoImage)}
            extensionId={extensionId}
          />
          <Stack direction="column" justify="between" customStyle="w-0 min-w-full">
            <Stack direction="row" spacing="gap-2">
              <Text variant="button-sm" truncate>
                {extensionName}
              </Text>

              {extensionApplicationType && (
                <Stack
                  customStyle="w-[18px] h-[18px] rounded-full shrink-0"
                  background={{ light: 'tertiaryLight', dark: 'tertiaryDark' }}
                  justify="center"
                  align="center"
                >
                  <ExtensionIcon size="xs" type={iconType} />
                </Stack>
              )}
            </Stack>
            <Text
              variant="footnotes2"
              weight="normal"
              color={{ light: 'grey4', dark: 'grey7' }}
              truncate
            >
              {extensionDescription || extensionDisplayName}
            </Text>
          </Stack>
        </Stack>

        <Stack
          direction="column"
          justify={showMenu ? 'between' : 'end'}
          align="end"
          customStyle="shrink-0"
          padding={showMenu ? 'p-0' : 'pr-4'}
        >
          {showMenu && (
            <Menu
              anchor={{
                icon: <EllipsisHorizontalIcon />,
                variant: 'primary',
                greyBg: true,
                iconOnly: true,
                'aria-label': 'settings',
              }}
              items={menuItems(
                getExtensionStatus(isExtensionLocalDraft, appStreamData?.edges[0]?.node?.status),
              )}
              customStyle="w-max z-99"
            />
          )}
          <Stack direction="row" align="center" spacing="gap-x-1.5">
            <Stack
              customStyle={`w-2 h-2 rounded-full ${getStatusIndicatorStyle(isExtensionLocalDraft, appStreamData?.edges[0]?.node?.status)}`}
            />
            <Text variant="footnotes2" weight="normal">
              {getExtensionStatus(isExtensionLocalDraft, appStreamData?.edges[0]?.node?.status)}
            </Text>
          </Stack>
        </Stack>
      </Stack>
      {showDivider && <Divider />}
    </Stack>
  );
};
