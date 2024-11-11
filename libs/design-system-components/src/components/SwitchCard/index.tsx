import React, { ReactNode } from 'react';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';

export type SwitchCardProps = {
  isLoggedIn: boolean;
  activeButton: string;
  buttonValues: { value: string; label: string }[];
  onTabClick: (value: string) => () => void;
};

export interface IStickyBoxProps {
  readonly userSignedIn?: boolean;
  children?: ReactNode;
}

const StickyBox: React.FC<IStickyBoxProps> = props => {
  const { userSignedIn, children } = props;
  return (
    <Stack customStyle={`sticky flex top-${userSignedIn ? '[3rem]' : '[6rem]'}`} fullWidth>
      <Stack customStyle="grid grid-cols-3 w-full">{children}</Stack>
    </Stack>
  );
};

const SwitchCard: React.FC<SwitchCardProps> = props => {
  const { isLoggedIn, activeButton, buttonValues, onTabClick } = props;

  const baseStyle = 'group p-2';

  const activeStyle = `border-b ${getColorClasses(
    {
      light: 'secondaryLight',
      dark: 'secondaryDark',
    },
    'border',
  )}`;
  const hoverStyle = `hover:border-b ${getColorClasses(
    {
      light: 'secondaryLight',
      dark: 'secondaryDark',
    },
    'hover:border',
  )}`;

  return (
    <>
      <StickyBox userSignedIn={isLoggedIn}>
        {buttonValues.map((el: { value: string; label: string }, idx: number) => (
          <button key={idx} onClick={onTabClick(buttonValues[idx].value)}>
            <Stack
              customStyle={`py-2 px-3 ${baseStyle} ${hoverStyle} ${
                el.value === activeButton ? activeStyle : ''
              }`}
            >
              <Text
                color={
                  el.value === activeButton
                    ? {
                        light: 'secondaryLight',
                        dark: 'secondaryDark',
                      }
                    : 'grey7'
                }
                weight={el.value === activeButton ? 'bold' : 'normal'}
                align="center"
                customStyle={getColorClasses(
                  {
                    light: 'secondaryLight',
                    dark: 'secondaryDark',
                  },
                  'group-hover:text',
                )}
              >
                {el.label}
              </Text>
            </Stack>
          </button>
        ))}
      </StickyBox>
    </>
  );
};

export default SwitchCard;
