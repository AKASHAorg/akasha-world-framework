import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';

export interface IEnableAllSettingProps {
  // data
  isSelected: boolean;
  // handlers
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

const EnableAllSetting: React.FC<IEnableAllSettingProps> = ({ isSelected, onChange }) => {
  const { t } = useTranslation('app-settings-ewa');

  return (
    <Stack customStyle="border(b-1 solid grey8 dark:grey5) mb-4">
      <Stack direction="row" justify="between" align="center" customStyle="my-4">
        <Text variant="body1">{t('Enable all')}</Text>
        <Checkbox
          id="enable-all-notifications-checkbox"
          value="Enable all"
          name="enable-all"
          isSelected={isSelected}
          handleChange={onChange}
          size="large"
          customStyle="w-6 h-6"
        />
      </Stack>
    </Stack>
  );
};

export default EnableAllSetting;
