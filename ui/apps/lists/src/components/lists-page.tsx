import React from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@akashaorg/design-system-core/lib/components/Box';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ListAppTopbar from '@akashaorg/design-system-components/lib/components/ListAppTopbar';
import DefaultEmptyCard from '@akashaorg/design-system-components/lib/components/DefaultEmptyCard';
import { EntityTypes, ModalNavigationOptions } from '@akashaorg/typings/ui';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useGetMyProfileQuery } from '@akashaorg/ui-awf-hooks/lib/generated/hooks-new';

const ListsPage: React.FC<unknown> = () => {
  const [showModal, setShowModal] = React.useState(false);

  const { t } = useTranslation('app-lists');
  const { navigateToModal } = useRootComponentProps();

  const bookmarkDelete = null;

  const profileDataReq = useGetMyProfileQuery(null, {
    select: resp => {
      return resp.viewer?.akashaProfile;
    },
  });
  const loggedProfileData = profileDataReq?.data;

  const isLoggedIn = React.useMemo(() => {
    return loggedProfileData?.did?.id;
  }, [loggedProfileData?.did?.id]);

  const listsReq = null;
  const lists = listsReq?.data || [];

  const bookmarkedBeamsIds = lists?.map((bm: Record<string, string>) => bm.itemId);
  const bookmarkedBeams = undefined;
  const numberOfBookmarkedInactivePosts = React.useMemo(
    () => bookmarkedBeams?.filter(({ data }) => (data ? data.active : false)).length,
    [bookmarkedBeams],
  );

  const showLoginModal = (redirectTo?: { modal: ModalNavigationOptions }) => {
    navigateToModal({ name: 'login', redirectTo });
  };

  const handleEntryFlag = (itemId: string, itemType: EntityTypes) => () => {
    if (!loggedProfileData?.did?.id) {
      return showLoginModal({ modal: { name: 'report-modal', itemId, itemType } });
    }
    navigateToModal({ name: 'report-modal', itemId, itemType });
  };

  const handleEntryRemove = (itemId: string) => {
    navigateToModal({
      name: 'entry-remove-confirmation',
      itemId,
      itemType: EntityTypes.BEAM,
    });
  };

  const handleIconMenuClick = () => {
    setShowModal(!showModal);
  };

  const removeAllBookmarkedItems = () => {
    bookmarkedBeamsIds.forEach(itemId => bookmarkDelete.mutate(itemId));
  };

  return (
    <Card elevation={'1'} radius={16} padding={'p-4'}>
      <ListAppTopbar resetLabel={t('Reset')} handleIconMenuClick={handleIconMenuClick} />
      {listsReq?.status === 'error' && (
        <ErrorLoader
          type="script-error"
          title={t('There was an error loading the lists')}
          details={listsReq?.error as string}
        />
      )}

      <Box data-testid="lists" customStyle="space-x-8 space-y-8">
        {/* <StartCard
            title={t('Lists')}
            subtitle={getSubtitleText()}
            heading={t('✨ Save what inspires you ✨')}
            description={description}
            image={'/images/no-saved-posts-error.webp'}
            showMainArea={!isLoggedIn}
          /> */}

        {!listsReq?.isFetched && isLoggedIn && <Spinner />}
        {(!isLoggedIn || (listsReq?.isFetched && (!lists || !lists.length))) && (
          <DefaultEmptyCard
            infoText={t('You don’t have any saved content in your List')}
            noBorder
            image="/images/listsapp-empty-min.webp"
          />
        )}
      </Box>
      <Modal
        title={{ label: t('Remove Content') }}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        actions={[
          {
            variant: 'secondary',
            label: t('Cancel'),
            onClick: () => {
              setShowModal(!showModal);
            },
          },
          {
            variant: 'primary',
            label: 'Remove All',
            onClick: () => {
              removeAllBookmarkedItems();
              setShowModal(!showModal);
            },
          },
        ]}
      >
        <Text variant="body1">
          {t('Are you sure you want to remove all saved content from your list?')}
        </Text>
      </Modal>
    </Card>
  );
};

export default ListsPage;
