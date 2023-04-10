import React from 'react';
import { tw } from '@twind/core';

import { IconType } from '@akashaorg/typings/ui';

import BasicCardBox from '@akashaorg/design-system-core/lib/components/BasicCardBox';
import Box from '@akashaorg/design-system-core/lib/components/Box';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export type OverviewCTA = {
  label: string;
  url: string;
  iconType: IconType;
};

export interface IModerationIntroCardProps {
  assetName?: string;
  titleLabel: string;
  introLabel: string;
  subtitleLabel: string;
  publicImgPath?: string;
  codeOfConductLabel: string;
  overviewCTAArr: OverviewCTA[];
  onCodeOfConductClick?: () => void;
}

const ModerationIntroCard: React.FC<IModerationIntroCardProps> = props => {
  const {
    assetName = 'moderation',
    titleLabel,
    introLabel,
    subtitleLabel,
    publicImgPath = '/images',
    codeOfConductLabel,
    overviewCTAArr,
    onCodeOfConductClick,
  } = props;

  return (
    <BasicCardBox pad="p-4" margin="mb-4">
      <Box customStyle="grid gap-4 grid-cols-1">
        <Text variant="h5" align="center">
          {titleLabel}
        </Text>

        <Box customStyle="w-40 h-40 my-2 mx-auto">
          <img
            className={tw('object-contain')}
            aria-label={assetName}
            src={`${publicImgPath}/${assetName}.webp`}
            alt={assetName}
            data-testid={`${assetName}-image`}
          />
        </Box>

        {introLabel && (
          <Text weight="bold" align="center">
            {introLabel}
          </Text>
        )}

        {subtitleLabel && (
          <Text variant="subtitle2" align="center">
            {subtitleLabel}
          </Text>
        )}

        {codeOfConductLabel && (
          <Button plain={true} onClick={onCodeOfConductClick}>
            <Text
              variant="subtitle2"
              color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
              weight="bold"
              align="center"
              customStyle="cursor-pointer"
            >
              {codeOfConductLabel}
            </Text>
          </Button>
        )}

        {overviewCTAArr && overviewCTAArr.length > 0 && (
          <Box customStyle="flex md:px-20 justify-between">
            {overviewCTAArr.map(({ url, label, iconType }) => (
              <Box key={label + iconType} customStyle="grid gap-1 grid-cols-1 w-[30%]">
                <Icon size="sm" accentColor={true} type={iconType} customStyle="mx-auto my-0" />
                <a
                  href={url}
                  className={tw(
                    'text-sm text-center font-bold no-underline text-secondaryLight dark:text-secondaryDark',
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid={`${iconType}-link`}
                >
                  {label}
                </a>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </BasicCardBox>
  );
};

export default ModerationIntroCard;
