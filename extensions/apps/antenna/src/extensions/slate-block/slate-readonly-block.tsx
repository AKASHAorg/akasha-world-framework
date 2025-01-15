import React from 'react';
import { BlockInstanceMethods, ContentBlockRootProps } from '@akashaorg/typings/lib/ui';
import ReadOnlyEditor from '@akashaorg/design-system-components/lib/components/ReadOnlyEditor';
import { decodeb64SlateContent, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';

export const SlateReadonlyBlock = (
  props: ContentBlockRootProps & { blockRef?: React.RefObject<BlockInstanceMethods> },
) => {
  const content = decodeb64SlateContent(props.content.value, props.logger);

  const { getCorePlugins } = useRootComponentProps();

  const navigateTo = React.useRef(getCorePlugins().routing.navigateTo);

  const handleMentionClick = profileDID => {
    navigateTo?.current({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}`,
    });
  };
  return (
    <Stack>
      <ReadOnlyEditor content={content} handleMentionClick={handleMentionClick} />
    </Stack>
  );
};
