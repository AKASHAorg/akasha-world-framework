import * as React from 'react';
import { useTranslation } from 'react-i18next';
import DS from '@akashaproject/design-system';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';

import routes from '../routes';
import { ISettingsItem, SettingsOption } from '../interfaces';
import { settingsItems } from '../utils/settings-items';

const { Box, BasicCardBox, Icon, Text } = DS;

const SettingsPage: React.FC<RootComponentProps> = props => {
  const { t } = useTranslation();

  const handleSettingsOptionClick = (option: SettingsOption) => () => {
    return props.singleSpa.navigateToUrl(routes[option]);
  };

  return (
    <Box direction="column" gap="small">
      <BasicCardBox>
        <Box
          pad="medium"
          justify="center"
          align="center"
          border={{ side: 'bottom', color: 'lightBorder' }}
        >
          <Text weight="bold" size="large">{`${t('Settings')}`}</Text>
        </Box>
        {settingsItems.map((item: ISettingsItem, idx: number) => (
          <Box
            key={`${idx}${item.label}`}
            direction="row"
            pad="medium"
            justify={item.isSubheading ? 'start' : 'between'}
            align="center"
            border={idx !== settingsItems.length - 1 && { side: 'bottom', color: 'lightBorder' }}
            onClick={
              item.clickable ? handleSettingsOptionClick(item.label as SettingsOption) : null
            }
          >
            <Text
              weight={item.isSubheading ? 'bold' : 'normal'}
              size="large"
              margin={item.isSubheading && { vertical: 'medium' }}
            >
              {`${t(item.label)}`}
            </Text>
            {!item.isSubheading && <Icon type="chevronRight" />}
          </Box>
        ))}
      </BasicCardBox>
    </Box>
  );
};

export default SettingsPage;
