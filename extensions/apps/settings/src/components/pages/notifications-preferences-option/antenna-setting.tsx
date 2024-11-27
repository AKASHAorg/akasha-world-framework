import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Card from '@akashaorg/design-system-core/lib/components/Card';
<<<<<<< HEAD
import { Info } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
=======
import {
  InfoLight,
  InfoDark,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
>>>>>>> 6f1f4b4c (chore: extract components)

export interface IAntennaSettingProps {
  // data
  isSelected: boolean;
<<<<<<< HEAD
=======
  isDarkTheme: boolean;
>>>>>>> 6f1f4b4c (chore: extract components)
  // handlers
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

<<<<<<< HEAD
const AntennaSetting: React.FC<IAntennaSettingProps> = ({ isSelected, onChange }) => {
=======
const AntennaSetting: React.FC<IAntennaSettingProps> = ({ isSelected, onChange, isDarkTheme }) => {
>>>>>>> 6f1f4b4c (chore: extract components)
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
<<<<<<< HEAD
        <Stack direction="row" spacing="gap-x-3" align="center">
          <Icon
            icon={<Info />}
            size="lg"
            solid={true}
            color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
          />
=======
        <Stack direction="row" spacing="gap-x-3">
          {isDarkTheme ? <InfoLight className="shrink-0" /> : <InfoDark className="shrink-0" />}
>>>>>>> 6f1f4b4c (chore: extract components)
          <Text variant="body1" customStyle="text-sm">
            {t('Changing notifications preferences requires a signature')}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
};

export default AntennaSetting;
