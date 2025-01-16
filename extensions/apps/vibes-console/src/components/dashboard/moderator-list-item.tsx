import React from 'react';
import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { Profile } from '@akashaorg/typings/lib/ui';
import { transformSource } from '@akashaorg/ui-core-hooks';

export type ModeratorListItemProps = {
  assignButtonLabel: string;
  assignedAdmin: boolean;
  selectedModerator: Profile;
  activeModerators: Profile[];
  onClickAssign: () => void;
};

const ModeratorListItem: React.FC<ModeratorListItemProps> = props => {
  const { assignButtonLabel, activeModerators, selectedModerator, assignedAdmin, onClickAssign } =
    props;

  if (assignedAdmin) {
    return (
      <Stack direction="row" spacing="gap-x-2" align="center" customStyle="mb-24">
        <Avatar
          avatar={transformSource(selectedModerator?.avatar?.default)}
          alternativeAvatars={selectedModerator?.avatar?.alternatives?.map(alternative =>
            transformSource(alternative),
          )}
        />

        <Stack>
          <Text
            variant="button-md"
            weight="bold"
            truncate={true}
          >{`${selectedModerator.name}`}</Text>

          <DidField did={selectedModerator.did.id} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing="gap-y-4">
      {activeModerators.map((moderator, idx) => (
        <React.Fragment key={moderator.name}>
          <Stack direction="row" align="center" justify="between">
            <Stack direction="row" spacing="gap-x-2" align="center">
              <Avatar
                avatar={transformSource(moderator?.avatar?.default)}
                alternativeAvatars={moderator?.avatar?.alternatives?.map(alternative =>
                  transformSource(alternative),
                )}
              />

              <Stack>
                <Text variant="button-md" weight="bold" truncate={true}>{`${moderator.name}`}</Text>

                <DidField did={moderator.did.id} />
              </Stack>
            </Stack>

            <Button label={assignButtonLabel} onClick={onClickAssign} />
          </Stack>

          {idx < activeModerators.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default ModeratorListItem;
