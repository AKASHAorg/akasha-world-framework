import React, { ReactElement } from 'react';
import DynamicInfiniteScroll, {
  DynamicInfiniteScrollProps,
} from '@akashaorg/design-system-components/lib/components/DynamicInfiniteScroll';
import InfoCard from '@akashaorg/design-system-core/lib/components/InfoCard';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils';
import { ENTRY_HEIGHT, ITEM_SPACING } from '../constants';
import { GetFollowersListByDidQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import { selectFollowers } from '@akashaorg/ui-awf-hooks/lib/selectors/get-followers-list-by-did-query';
import { EngagementsEntry } from '../engagements-entry';

export type FollowersProps = {
  followersData: GetFollowersListByDidQuery;
  authenticatedDID: string;
  emptyEntryTitleLabel: ReactElement;
  emptyEntryBodyLabel: ReactElement;
  showNsfw: boolean;
  profileAnchorLink: string;
} & Pick<DynamicInfiniteScrollProps, 'hasNextPage' | 'loading' | 'onLoadMore'>;

const Followers: React.FC<FollowersProps> = ({
  followersData,
  authenticatedDID,
  emptyEntryTitleLabel,
  emptyEntryBodyLabel,
  showNsfw,
  profileAnchorLink,
  hasNextPage,
  loading,
  onLoadMore,
}) => {
  const followers = selectFollowers(followersData);

  if (followers.length === 0) {
    return (
      <InfoCard
        titleLabel={emptyEntryTitleLabel}
        bodyLabel={emptyEntryBodyLabel}
        assetName="longbeam-notfound"
        customStyle="px-4"
      />
    );
  }

  const borderBottomStyle = `pb-[${ITEM_SPACING / 16}rem] border-b ${getColorClasses(
    {
      light: 'grey8',
      dark: 'grey5',
    },
    'border',
  )}`;

  return (
    <DynamicInfiniteScroll
      count={followers.length}
      estimatedHeight={ENTRY_HEIGHT}
      overScan={1}
      itemSpacing={ITEM_SPACING}
      hasNextPage={hasNextPage}
      loading={loading}
      onLoadMore={onLoadMore}
    >
      {({ index, itemIndex, itemsSize }) => {
        const follower = followers[itemIndex];
        const profileInfo = follower?.did?.akashaProfile;
        return (
          <EngagementsEntry
            profileID={follower.profileID}
            profileInfo={profileInfo}
            authenticatedDID={authenticatedDID}
            showNsfw={showNsfw}
            profileAnchorLink={profileAnchorLink}
            customStyle={index + 1 !== itemsSize ? borderBottomStyle : ''}
          />
        );
      }}
    </DynamicInfiniteScroll>
  );
};

export default Followers;
