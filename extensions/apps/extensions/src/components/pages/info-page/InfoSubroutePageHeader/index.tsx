import * as React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import {
  AkashaAppApplicationType,
  AppImageSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { transformSource } from '@akashaorg/ui-awf-hooks/lib/utils/media-utils';

export type ExtensionHeaderProps = {
  pageTitle?: string;
  appName: string;
  packageName?: string;
  appType?: AkashaAppApplicationType;
  nsfw?: boolean;
  description?: string;
  appLogo?: AppImageSource;
};

/**
 * Component used in the extension info page
 * @param pageTitle - optional page title
 * @param appName - display name of the extension
 * @param packageName - unique identifier for the extension
 * @param appType - type of extension
 * @param description - optional description for the extension
 * @param nsfw - sets if the extension is safe for work or not
 */
const ExtensionHeader: React.FC<ExtensionHeaderProps> = ({
  pageTitle,
  appName,
  packageName,
  appType,
  nsfw,
  appLogo,
}) => {
  return (
    <Stack spacing="gap-y-4">
      {pageTitle && <Text variant="h5">{pageTitle}</Text>}
      <Stack direction="row" align="center" spacing="gap-x-2">
        <AppAvatar height={3} width={3} appType={appType} avatar={transformSource(appLogo)} />
        <Stack direction="column" spacing="gap-y-0">
          <Text variant="h6">{appName}</Text>
          <Text
            variant="footnotes2"
            weight="normal"
            color={{ light: 'grey4', dark: 'grey7' }}
            truncate={true}
          >
            {packageName}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ExtensionHeader;
