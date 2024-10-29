import React from 'react';
import { useTranslation } from 'react-i18next';
import getSDK from '@akashaorg/core-sdk';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
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
import { ExtensionStatus, Extension } from '@akashaorg/typings/lib/ui';
import { useNavigate } from '@tanstack/react-router';
import {
  getExtensionStatus,
  getIconByAppType,
  getStatusIndicatorStyle,
} from '../../../utils/extension-utils';

type ExtensionElement = {
  extensionData: Extension;
  showDivider?: boolean;
  filter?: { id?: string; title?: string; opt?: string };
  showMenu?: boolean;
};

export const ExtensionElement: React.FC<ExtensionElement> = ({
  extensionData,
  showDivider = false,
  filter,
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
            equalTo: extensionData?.id,
          },
        },
      },
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    skip:
      !extensionData?.id ||
      !extensionData?.id?.trim() ||
      extensionData?.id?.length < 10 ||
      extensionData?.localDraft,
  });

  const appStreamData =
    appStreamReq?.node && hasOwn(appStreamReq.node, 'akashaAppsStreamList')
      ? appStreamReq.node.akashaAppsStreamList
      : null;

  const handleExtensionRemove = () => {
    navigateToModal({
      name: `remove-extension-confirmation`,
      extensionId: extensionData?.id,
    });
  };

  const handleExtensionEdit = () => {
    navigate({
      to: `/edit-extension/$extensionId/step1`,
      params: { extensionId: extensionData?.id },
    });
  };

  const handleExtensionSubmit = () => {
    navigate({
      to: `/publish-extension/$extensionId`,
      params: { extensionId: extensionData?.id },
    });
  };

  const handleReleaseManager = () => {
    navigate({
      to: `/release-manager/$extensionId`,
      params: { extensionId: extensionData?.id },
    });
  };

  const menuItems = (extensionStatus: string): MenuProps['items'] | [] => {
    switch (extensionStatus) {
      case ExtensionStatus.InReview:
        return [
          {
            label: t('Edit Extension'),
            icon: <PencilIcon />,
            onClick: handleExtensionEdit,
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
            onClick: () => {},
          },

          {
            label: t('Edit Extension'),
            icon: <PencilIcon />,
            onClick: handleExtensionEdit,
          },
          {
            label: t('Release Manager'),
            icon: <RectangleStackIcon />,
            onClick: handleReleaseManager,
          },
          {
            label: t('Delete Extension'),
            icon: <TrashIcon />,
            onClick: () => {},
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
            onClick: handleExtensionEdit,
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
      if (filter.id === '0') {
        return true;
      }
      return (
        filter.title ===
        getExtensionStatus(extensionData?.localDraft, appStreamData?.edges[0]?.node?.status)
      );
    }
  };

  return (
    <>
      {showElement() && (
        <Stack spacing="gap-y-4">
          <Stack direction="row" justify="between" spacing="gap-x-8" fullWidth>
            <Stack direction="row" spacing="gap-x-3" customStyle="max-h-[60px] w-[60%]">
              <AppAvatar
                appType={extensionData?.applicationType}
                avatar={transformSource(extensionData?.logoImage)}
                extensionId={extensionData?.id}
              />
              <Stack direction="column" justify="between" customStyle="w-0 min-w-full">
                <Stack direction="row" spacing="gap-2">
                  <Text variant="button-sm" truncate>
                    {extensionData?.name}
                  </Text>

                  {extensionData?.applicationType && (
                    <Stack
                      customStyle="w-[18px] h-[18px] rounded-full shrink-0"
                      background={{ light: 'tertiaryLight', dark: 'tertiaryDark' }}
                      justify="center"
                      align="center"
                    >
                      <Icon
                        color={{ light: 'white', dark: 'white' }}
                        size={'xs'}
                        solid
                        icon={getIconByAppType(extensionData?.applicationType)}
                      />
                    </Stack>
                  )}
                </Stack>
                <Text
                  variant="footnotes2"
                  weight="normal"
                  color={{ light: 'grey4', dark: 'grey7' }}
                  truncate
                >
                  {extensionData?.description || extensionData?.displayName}
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
                    getExtensionStatus(
                      extensionData?.localDraft,
                      appStreamData?.edges[0]?.node?.status,
                    ),
                  )}
                  customStyle="w-max z-99"
                />
              )}
              <Stack direction="row" align="center" spacing="gap-x-1.5">
                <Stack
                  customStyle={`w-2 h-2 rounded-full ${getStatusIndicatorStyle(extensionData?.localDraft, appStreamData?.edges[0]?.node?.status)}`}
                />
                <Text variant="footnotes2" weight="normal">
                  {getExtensionStatus(
                    extensionData?.localDraft,
                    appStreamData?.edges[0]?.node?.status,
                  )}
                </Text>
              </Stack>
            </Stack>
          </Stack>
          {showDivider && <Divider />}
        </Stack>
      )}
    </>
  );
};
