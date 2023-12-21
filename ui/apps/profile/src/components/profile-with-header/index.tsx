import React, { PropsWithChildren, Suspense } from 'react';
import ProfileHeaderView, { ProfileHeaderViewProps } from './profile-header-view';
import { ProfileHeaderLoading } from '@akashaorg/design-system-components/lib/components/Profile';

const ProfileWithHeader: React.FC<PropsWithChildren<ProfileHeaderViewProps>> = props => {
  const { children, ...rest } = props;

  return (
    <>
      <Suspense fallback={<ProfileHeaderLoading />}>
        <ProfileHeaderView {...rest} />
      </Suspense>
      {children}
    </>
  );
};

export default ProfileWithHeader;
