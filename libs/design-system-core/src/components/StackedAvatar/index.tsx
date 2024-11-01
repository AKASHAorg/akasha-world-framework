import React from 'react';
import { apply, tw } from '@twind/core';

import Avatar, { AvatarSize } from '../Avatar';
import type { Image, Profile } from '@akashaorg/typings/lib/ui';

export type StackedAvatarProps = {
  userData: { did: Profile['did']; avatar?: Image; alternativeAvatars?: Image[] }[];
  maxAvatars?: number;
  size?: AvatarSize;
};

/**
 * The StackedAvatar component is an UI element that serves a specific use case: to display multiple
 * user avatars stacked together. You often see such stacked avatars used in social media for indicating
 * the number of users who have liked/interacted on a piece of content.
 * @param userData - supply a list of objects containing info about the user and their avatar here for display
 * @param maxAvatars - (optional) maximum number of avatar to be stacked togetherr
 * @param size - (optional) for customizing the size of the avatars
 * @example
 * ```tsx
 *  const userData = [
      {
        "name": "Alice",
        "id": "410490050000320006570034567114572000",
        "did": {
          "id": "did:pkh:eip155:1:0x003410490050000320006570034567114572000",
          "isViewer": true
        },
        "avatar": {
          "src": "https://placebeard.it/360x360",
          "width": 360,
          "height": 360
        },
        "createdAt": "2021-03-01T00:00:00.000Z",
        "followers": {},
        "followersCount": 0
      },
      {
        "name": "Bob",
        "id": "410490050000320006570034567114572001",
        "did": {
          "id": "did:pkh:eip155:1:0x003410490050000320006570034567114572001",
          "isViewer": false
        },
        "avatar": {
          "src": "https://placebeard.it/360x360",
          "width": 360,
          "height": 360
        },
        "createdAt": "2021-03-01T00:00:00.000Z",
        "followers": {},
        "followersCount": 0
      },
    ]
 *   <StackedAvatar userData={userData} maxAvatar={4} />
 * ```
 **/
const StackedAvatar: React.FC<StackedAvatarProps> = props => {
  const { userData, maxAvatars, size } = props;
  let data = userData;
  if (maxAvatars) {
    data = userData.slice(0, maxAvatars);
  }

  const renderStack = (level: number) => {
    const zIndex = level + 1;

    const className = apply`inline-flex z-[${zIndex}] -ml-${zIndex > 1 ? '3' : '0'}`;

    return (
      <div className={tw(className)}>
        <Avatar
          // clickable avatars
          onClick={() => {
            /** */
          }}
          profileId={data[level]?.did?.id}
          avatar={data[level]?.avatar}
          alternativeAvatars={data[level]?.alternativeAvatars}
          size={size}
          border="xs"
        />
        {level + 1 < data.length && renderStack(level + 1)}
      </div>
    );
  };

  return <div className={tw('flex flex-row')}>{renderStack(0)}</div>;
};

export default StackedAvatar;
