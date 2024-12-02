import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { Info } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';

export interface IAntennaSettingProps {
  // data
  isSelected: boolean;
  // handlers
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

const AntennaSetting: React.FC<IAntennaSettingProps> = ({ isSelected, onChange }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Stack>
      <Stack direction="row" justify="between" align="center">
        <Text variant="body1">{t('Antenna')}</Text>
        <Checkbox
          id="antenna-checkbox"
          value="Antenna"
          name="antenna"
          isSelected={isSelected}
          handleChange={onChange}
          size="large"
          customStyle="w-6 h-6"
        />
      </Stack>

      <Text variant="footnotes2" weight="normal" customStyle="dark:text-grey6 text-grey4 mt-2">
        {t(
          'Get notifications about new reflections on your beams people you follow & your interests.',
        )}
      </Text>
      <Card padding="p-3" customStyle="mt-4" background={{ light: 'grey9', dark: 'grey3' }}>
        <Stack direction="row" spacing="gap-x-3" align="center">
          <Icon
            icon={<Info />}
            size="lg"
            solid={true}
            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
          />
          <Text variant="body1" customStyle="text-sm">
            {t('Changing notifications preferences requires a signature')}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
};

export default AntennaSetting;
