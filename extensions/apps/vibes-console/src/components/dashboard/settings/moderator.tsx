import React from 'react';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import {
  PageHeader,
  PageHeaderProps,
} from '@akashaorg/design-system-components/lib/components/PageHeader';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { TSection } from './admin';

export type ModeratorSettingsProps = PageHeaderProps & {
  sections: {
    one: TSection;
    two: TSection;
  };
};

export const ModeratorSettings: React.FC<ModeratorSettingsProps> = props => {
  const {
    sections: { one, two },
  } = props;

  return (
    <PageHeader {...props}>
      <Stack spacing="gap-y-4" customStyle="mb-24">
        <Stack direction="row" align="center" justify="between">
          <Text variant="button-md" color={{ light: 'black', dark: 'grey6' }}>
            {one.title}
          </Text>
          <Text variant="footnotes2" weight="normal" color={{ light: 'grey4', dark: 'grey7' }}>
            01-Jan-2015
          </Text>
        </Stack>
        <Divider />
        <Stack direction="row" align="start" justify="between">
          <Stack spacing="gap-y-3">
            <Text variant="button-md" color={{ light: 'black', dark: 'grey6' }}>
              {two.title}
            </Text>
            <Text variant="footnotes2" weight="normal">
              {two.description}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </PageHeader>
  );
};
