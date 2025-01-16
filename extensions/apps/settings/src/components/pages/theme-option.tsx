import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@akashaorg/ui-core-hooks';
import {
  MoonIcon,
  SunIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';

import PageLayout from './base-layout';

export type theme = 'Light-Theme' | 'Dark-Theme';

const ThemeOption: React.FC = () => {
  const { t } = useTranslation('app-settings-ewa');

  const { theme, propagateTheme } = useTheme();

  const handleThemeSelect = () => {
    const selectedTheme = theme === 'Dark-Theme' ? 'Light-Theme' : 'Dark-Theme';

    propagateTheme(selectedTheme, true);
  };

  return (
    <PageLayout title={t('Theme')}>
      <Stack padding="p-4" spacing="gap-y-2">
        <Stack direction="row" justify="between" align="center">
          <Text weight="bold">{t('What mode are you feeling today?')}</Text>

          <Toggle
            checked={theme === 'Light-Theme'}
            iconChecked={<SunIcon />}
            iconUnchecked={<MoonIcon />}
            onChange={handleThemeSelect}
          />
        </Stack>

        <Text>
          {t('You can change your theme between dark mode or light mode! Which side are you on 😼')}
        </Text>
      </Stack>
    </PageLayout>
  );
};

export default ThemeOption;
