import React from 'react';
import { transformSource } from '@akashaorg/ui-core-hooks';
import { Profile } from '@akashaorg/typings/lib/ui';
import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Tooltip from '@akashaorg/design-system-core/lib/components/Tooltip';
import { formatDate } from '@akashaorg/design-system-core/lib/utils';
import { TApplicationStatus, renderStatusDetail } from '../../../utils';

export type ApplicantDataCardProps = {
  applicant: {
    name: string;
    did: { id: string };
    status: TApplicationStatus;
    avatar: Profile['avatar'];
    appliedOn: Date;
    memberSince: Date;
  };
  isMini?: boolean;
  tenureInfoLabel: string;
  appliedOnLabel: string;
  viewProfileLabel: string;
  viewApplicationLabel?: string;
  onClickViewProfile: () => void;
  onClickViewApplication?: () => void;
};

export const ApplicantDataCard: React.FC<ApplicantDataCardProps> = props => {
  const {
    applicant,
    tenureInfoLabel,
    appliedOnLabel,
    viewProfileLabel,
    viewApplicationLabel,
    isMini = false,
    onClickViewProfile,
    onClickViewApplication,
  } = props;

  const textStyle = 'max-w([12.5rem] md:[7.5rem]) w-fit cursor-default';

  return (
    <Card padding={0}>
      <Stack padding="p-4" spacing="gap-y-4">
        <Stack direction="row" justify="between">
          <Stack direction="row" spacing="gap-x-2" align="center">
            <Avatar
              size={isMini ? 'lg' : 'md'}
              avatar={transformSource(applicant?.avatar?.default)}
              alternativeAvatars={applicant?.avatar?.alternatives?.map(alternative =>
                transformSource(alternative),
              )}
            />
            <Stack>
              <Tooltip content={applicant.name} placement="right">
                <Text variant="body2" weight="bold" customStyle={textStyle}>
                  {applicant.name}
                </Text>
              </Tooltip>

              <DidField did={applicant.did.id} />
            </Stack>
          </Stack>

          {isMini && <Button label={viewProfileLabel} onClick={onClickViewProfile} />}
          {!isMini && renderStatusDetail(applicant.status)}
        </Stack>

        <Divider />

        <Stack direction="row" justify="between">
          <Stack>
            <Text variant="button-md" weight="bold">
              {appliedOnLabel}:
            </Text>

            <Text variant="footnotes2" weight="light" color={{ light: 'grey4', dark: 'grey6' }}>
              {formatDate(applicant.appliedOn.toISOString(), 'DD MMM YYYY')}
            </Text>
          </Stack>

          <Stack>
            <Text variant="button-md" weight="bold">
              {tenureInfoLabel}:
            </Text>

            <Text variant="footnotes2" weight="light" color={{ light: 'grey4', dark: 'grey6' }}>
              {formatDate(applicant.memberSince.toISOString(), 'DD MMM YYYY')}
            </Text>
          </Stack>
        </Stack>
      </Stack>
      {!isMini && (
        <Stack
          direction="row"
          padding="p-4"
          align="center"
          justify="between"
          customStyle="border(t-1 solid grey8 dark:grey5"
        >
          <Button label={viewProfileLabel} onClick={onClickViewProfile} />
          {viewApplicationLabel && (
            <Button
              variant="primary"
              label={viewApplicationLabel}
              onClick={onClickViewApplication}
            />
          )}
        </Stack>
      )}
    </Card>
  );
};
