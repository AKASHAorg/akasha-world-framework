import React from 'react';
import { transformSource } from '@akashaorg/ui-core-hooks';
import { Moderator } from '@akashaorg/typings/lib/ui';
import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Tooltip from '@akashaorg/design-system-core/lib/components/Tooltip';
import { formatDate } from '@akashaorg/design-system-core/lib/utils';
import { getModeratorStatusIndicator } from '../../utils';

export type ModeratorDetailCardProps = {
  moderator: Moderator;
  tenureInfoLabel: string;
  moderatedLabel: string;
  moderatedItemsLabel: string;
  viewProfileLabel: string;
};

const ModeratorDetailCard: React.FC<ModeratorDetailCardProps> = props => {
  const { moderator, tenureInfoLabel, moderatedLabel, moderatedItemsLabel, viewProfileLabel } =
    props;

  const textStyle = 'max-w([12.5rem] md:[7.5rem]) w-fit cursor-default';

  return (
    <Card padding={16} customStyle="space-y-4">
      <Stack direction="row" justify="between">
        <Stack direction="row" spacing="gap-x-2" align="center">
          <Avatar
            size="lg"
            avatar={transformSource(moderator?.avatar?.default)}
            alternativeAvatars={moderator?.avatar?.alternatives?.map(alternative =>
              transformSource(alternative),
            )}
          />
          <Stack>
            <Stack direction="row" align="center" spacing="gap-x-1">
              <Tooltip content={moderator.name} placement="right">
                <Text
                  variant="body2"
                  weight="bold"
                  customStyle={textStyle}
                >{`${moderator.name}`}</Text>
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

        <Button label={viewProfileLabel} />
      </Stack>

      <Divider />

      <Stack direction="row" justify="between">
        <Stack>
          <Text variant="footnotes2" weight="normal" color={{ light: 'grey4', dark: 'grey6' }}>
            {tenureInfoLabel}:
          </Text>

          <Text variant="footnotes2" weight="normal">
            {moderator.status === 'active'
              ? formatDate(new Date(moderator.createdAt).toISOString(), 'DD MMM YYYY')
              : `${formatDate(moderator.createdAt.toISOString(), 'MMM YYYY')} - ${formatDate(
                  moderator.moderatorEndDate.toISOString(),
                  'DD MMM YYYY',
                )}`}
          </Text>
        </Stack>

        <Stack>
          <Text variant="footnotes2" weight="normal" color={{ light: 'grey4', dark: 'grey6' }}>
            {moderatedLabel}:
          </Text>

          <Text variant="footnotes2" weight="normal">
            {`${moderator.moderatedItems} ${moderatedItemsLabel}`}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ModeratorDetailCard;
