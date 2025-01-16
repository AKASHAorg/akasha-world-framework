import React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { Blocks } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { Antenna } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { useTranslation } from 'react-i18next';
import { useGetAppsByIdQuery } from '@akashaorg/ui-core-hooks/lib/generated';
import { selectAppDisplayName } from '@akashaorg/ui-core-hooks/lib/selectors/get-apps-by-id-query';

type ActionButtonsProps = {
  appId: string;
  showHiddenContent: boolean;
  showBlockName: boolean;
  onShowBlockName: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = props => {
  const { appId, showHiddenContent, showBlockName, onShowBlockName } = props;
  const { t } = useTranslation('ui-lib-feed');
  const appReq = useGetAppsByIdQuery({
    variables: {
      id: appId,
    },
    skip: !appId,
  });
  const appDisplayName = selectAppDisplayName(appReq.data);
  const showBlockNameStyle = `${
    showBlockName ? 'rounded-full h-9 w-9' : ''
  } transition-all ease-linear duration-300`;
  return (
    <>
      {appDisplayName && (
        <Stack direction="row" align="center" spacing="gap-x-2" customStyle="mr-auto">
          <Icon icon={<Antenna />} solid={true} accentColor size="sm" />
          <Text variant="footnotes2" weight="normal" color={{ light: 'grey7', dark: 'grey6' }}>
            {t('Published via {{name}}', { name: appDisplayName })}
          </Text>
        </Stack>
      )}
      {showHiddenContent && (
        <Button onClick={onShowBlockName} plain>
          <Stack
            align="center"
            justify="center"
            background={
              showBlockName ? { light: 'secondaryLight/30', dark: 'grey5' } : 'transparent'
            }
            customStyle={showBlockNameStyle}
          >
            <Icon icon={<Blocks />} accentColor={true} />
          </Stack>
        </Button>
      )}
    </>
  );
};

export default ActionButtons;
