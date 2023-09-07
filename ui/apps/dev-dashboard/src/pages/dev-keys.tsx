import React from 'react';
import { useTranslation } from 'react-i18next';

import { RootComponentProps } from '@akashaorg/typings/ui';

import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import DevKeyCard from '@akashaorg/design-system-components/lib/components/DevKeyCard';

import { CardWrapper } from '../components/common';

import menuRoute, { ADD_DEV_KEY, DEV_KEYS } from '../routes';
import { sampleDevKeys } from '../utils/dummy-data';

export const DevKeysCard: React.FC<RootComponentProps> = props => {
  const { plugins } = props;

  const navigateTo = plugins['@akashaorg/app-routing']?.routing.navigateTo;

  const { t } = useTranslation('app-dev-dashboard');

  // @TODO: needs update
  const getKeysQuery = { isFetching: false };

  const devKeys = sampleDevKeys;

  const handleAddDevKey = () => {
    navigateTo?.({
      appName: '@akashaorg/app-dev-dashboard',
      getNavigationUrl: () => menuRoute[ADD_DEV_KEY],
    });
  };

  const handleEditClick = (id: string) => () => {
    navigateTo?.({
      appName: '@akashaorg/app-dev-dashboard',
      getNavigationUrl: () => `${menuRoute[DEV_KEYS]}/${id}/edit`,
    });
  };

  const handleDeleteClick = (id: string, keyName: string) => () => {
    props.navigateToModal({ name: 'delete-dev-key', id, keyName });
  };

  return (
    <CardWrapper
      titleLabel={t('Dev Keys')}
      confirmButtonLabel={t('New Dev Key')}
      onConfirmButtonClick={handleAddDevKey}
    >
      <Stack customStyle={`${!getKeysQuery.isFetching && !!devKeys.length ? 'p-0' : 'p-4'}`}>
        {getKeysQuery.isFetching && <Spinner />}

        {!getKeysQuery.isFetching && (
          <>
            {!devKeys.length && (
              <Text variant="subtitle1" align="center">
                {t('You have not added any keys yet. Use the button to add some')}
              </Text>
            )}

            {!!devKeys.length &&
              devKeys.map(item => (
                <React.Fragment key={`${item.id} ${item.name}`}>
                  <DevKeyCard
                    nonameLabel={t('Unnamed Key')}
                    unusedLabel={t('Inactive')}
                    usedLabel={t('Active')}
                    devPubKeyLabel={t('Dev Public Key 🔑')}
                    dateAddedLabel={t('Date added 🗓')}
                    editable={true}
                    item={item}
                    onEditButtonClick={handleEditClick(item.id)}
                    onDeleteButtonClick={handleDeleteClick(item.id, item.name)}
                  />

                  <Divider />
                </React.Fragment>
              ))}
          </>
        )}
      </Stack>
    </CardWrapper>
  );
};
