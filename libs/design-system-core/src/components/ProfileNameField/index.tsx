import React from 'react';
import Text, { FontWeight } from '../Text';
import Tooltip from '../Tooltip';
import Stack from '../Stack';
import Icon from '../Icon';
import { ExclamationTriangleIcon } from '../Icon/hero-icons-outline';
import { getDidNetworkType, truncateDid } from '../../utils/did-utils';
import { getColorClasses } from '../../utils';
import { Color } from '../types/common.types';

export type ProfileNameFieldProps = {
  did: string;
  profileName?: string;
  nsfwLabel?: string;
  truncateText?: boolean;
  weight?: FontWeight;
  size?: 'sm' | 'md' | 'lg';
  color?: Color;
  showMissingNameWarning?: boolean;
  missingNameWarningLabel?: string;
  hover?: boolean;
};

/**
 * The ProfileNameField component covers the displaying of the profile name in various scenarios:
 * - When there is no profile name available, a truncated DID address will be displayed instead
 * - When the `showMissingNameWarning` prop is true and a `missingNameWarningLabel` is provided, a
 * tooltip will appear when a user hovers over the DID (when profile name is missing) with the `missingNameWarningLabel`
 * content, which normally explains the limitation associated with not having set up a profile (Note that
 * a profile name is required when setting up your profile).
 * @param did - the profile DID address
 * @param profileName - (optional) profile name if any
 * @param nsfwLabel - (optional) adds label for NSFW profiles
 * @param truncateText - boolean (optional) whether to truncate the label (profile name) when it's too long
 * @param size - (optional) the default size is `sm`
 * @param showMissingNameWarning - boolean (optional) whether to include a tooltip with explanation when hovering over a DID
 * @param missingNameWarningLabel - (optional) the text that will be in the tooltip
 * @param hover - (optional) boolean flag to enable or disable hover
 * @example
 * ```tsx
 *    <ProfileNameField
        did='did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493'
        truncateText={true}
        profileName='WonderfulCat'
      />
 * ```
 **/
const ProfileNameField: React.FC<ProfileNameFieldProps> = ({
  did,
  profileName,
  nsfwLabel = '',
  truncateText,
  size = 'sm',
  weight = 'bold',
  color,
  showMissingNameWarning,
  missingNameWarningLabel,
  hover = false,
}) => {
  const textTruncateStyle = `${truncateText ? `max-w(${nsfwLabel.length ? '[5rem]' : '[7rem]'} xs:[2rem])` : ''}`;
  const textHoverStyle = hover
    ? `cursor-pointer hover:underline ${getColorClasses(
        { light: 'black', dark: 'white' },
        'hover:decoration',
      )} group-hover:underline ${getColorClasses(
        { light: 'black', dark: 'white' },
        'group-hover:decoration',
      )}`
    : '';

  const networkType = getDidNetworkType(did);
  const truncatedDid = truncateDid(did, networkType);

  if (profileName) {
    return (
      <Stack direction="row" spacing="gap-x-1">
        <Text
          variant={`button-${size}`}
          weight={weight}
          color={color}
          truncate={true}
          customStyle={`${textTruncateStyle} ${textHoverStyle}`}
        >
          {profileName}
        </Text>
        {!!nsfwLabel.length && (
          <Text
            variant={`button-${size}`}
            weight="bold"
            color={{ light: 'errorLight', dark: 'errorDark' }}
          >
            {nsfwLabel}
          </Text>
        )}
      </Stack>
    );
  }
  return (
    <Stack direction="row" spacing="gap-2">
      <Text variant={`button-${size}`} weight="bold" customStyle={textHoverStyle}>
        {truncatedDid}
      </Text>
      {showMissingNameWarning && (
        <Tooltip
          placement="bottom"
          content={missingNameWarningLabel}
          trigger="click"
          customStyle="justify-center"
          contentCustomStyle="w-52"
        >
          <Icon
            icon={<ExclamationTriangleIcon />}
            color={{ light: 'errorLight', dark: 'errorDark' }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export default ProfileNameField;
