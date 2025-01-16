import React from 'react';

import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Tooltip from '@akashaorg/design-system-core/lib/components/Tooltip';
import { formatDate } from '@akashaorg/design-system-core/lib/utils';
import { getModeratorStatusIndicator } from '../../utils';
import { Moderator } from '@akashaorg/typings/lib/ui';
import { ChevronRightIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { transformSource } from '@akashaorg/ui-core-hooks';

export type ModeratorDetailMiniCardProps = {
  moderator: Moderator;
  hasBorderBottom: boolean;
  tenureInfoLabel: string;
  moderatedItemsLabel: string;
  onCardClick: (profileId: string) => void;
};

const ModeratorDetailMiniCard: React.FC<ModeratorDetailMiniCardProps> = props => {
  const { moderator, hasBorderBottom, tenureInfoLabel, moderatedItemsLabel, onCardClick } = props;

  const borderBottomStyle = `${hasBorderBottom ? 'border(b-1 solid grey8 dark:grey3)' : ''}`;

  const textStyle = 'max-w([12.5rem] md:[7.5rem]) w-fit cursor-default';

  return (
    <Stack padding="py-4" direction="row" customStyle={`flex-none ${borderBottomStyle}`}>
      <Stack
        direction="row"
        spacing="gap-x-2"
        align="start"
        padding="px-4"
        customStyle="w([50%] md:[45%])"
      >
        <Avatar
          avatar={transformSource(moderator?.avatar?.default)}
          alternativeAvatars={moderator?.avatar?.alternatives?.map(alternative =>
            transformSource(alternative),
          )}
        />
        <Stack>
          <Stack direction="row" align="center" spacing="gap-x-1">
            <Tooltip content={moderator.name} placement="right">
              <Text variant="body2" weight="bold" truncate={true} customStyle={textStyle}>
                {moderator.name}
              </Text>
            </Tooltip>
            <Stack
              customStyle={`w-1.5 h-1.5 rounded-full ${getModeratorStatusIndicator(
                moderator.status,
              )}`}
            />
          </Stack>

          <DidField did={moderator.did.id} />
        </Stack>
      </Stack>

      <Stack
        direction="row"
        padding="px-4"
        justify="between"
        align="center"
        customStyle="w([50%] md:[55%])"
      >
        <Stack>
          <Text variant="footnotes2" weight="normal" color={{ light: 'grey4', dark: 'grey7' }}>
            {tenureInfoLabel}:
          </Text>

          <Text variant="footnotes2" weight="normal">
            {moderator.status === 'active'
              ? `${moderator.moderatedItems} ${moderatedItemsLabel}`
              : formatDate(moderator.moderatorEndDate.toISOString(), 'DD MMM YYYY')}
          </Text>
        </Stack>

        <Button plain={true} onClick={() => onCardClick(moderator.did.id)}>
          <Icon icon={<ChevronRightIcon />} accentColor={true} customStyle="justify-end" />
        </Button>
      </Stack>
    </Stack>
  );
};

export default ModeratorDetailMiniCard;
