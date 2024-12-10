import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import TextLine from '@akashaorg/design-system-core/lib/components/TextLine';
import React from 'react';

const LoadingSettingsPlaceholder: React.FC = () => (
  <>
    <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4 pb-4">
      <Stack direction="row" justify="between" align="center" customStyle="mt-4">
        <TextLine animated={true} width="w-1/4" height="h-[1.5rem]" round="rounded" />
        <TextLine animated={true} width="w-[1.5rem]" height="h-[1.5rem]" round="rounded" />
      </Stack>

      <Text variant="footnotes2" weight="normal" customStyle="dark:text-grey6 text-grey4 mt-2">
        <TextLine animated={true} width="w-2/3" height="h-[1rem]" round="rounded" />
      </Text>
    </Stack>

    <Stack>
      <Stack direction="row" justify="between" align="center" customStyle="mt-4">
        <TextLine animated={true} width="w-1/4" height="h-[1.5rem]" round="rounded" />
        <TextLine animated={true} width="w-[1.5rem]" height="h-[1.5rem]" round="rounded" />
      </Stack>

      <Text variant="footnotes2" weight="normal" customStyle="dark:text-grey6 text-grey4 mt-2">
        <TextLine animated={true} width="w-2/3" height="h-[1rem]" round="rounded" />
      </Text>
    </Stack>
  </>
);

export default LoadingSettingsPlaceholder;
