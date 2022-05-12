import React from 'react';
import { Box, Text } from 'grommet';
import styled, { css } from 'styled-components';
import { isMobileOnly } from 'react-device-detect';

import Button from '../Button';
import Icon from '../Icon';

import { BasicCardBox } from '../EntryCard/basic-card-box';

export interface ISwitchCard {
  count?: number;
  loggedUser: string | null;
  hasIcon?: boolean;
  countLabel?: string;
  activeButton: string;
  tabButtons: React.ReactElement;
  buttonValues: { value: string; label: string }[];
  hasMobileDesign?: boolean;
  onIconClick?: () => void;
  buttonsWrapperWidth?: string;
  wrapperMarginBottom?: string;
  onTabClick: (value: string) => () => void;
  style?: React.CSSProperties;
  className?: string;
  tabForm?: TAB_TOOLBAR_TYPE;
}

export interface ISwitchCardButtonProps {
  readonly removeBorder?: boolean;
}

const SwitchCardButton = styled(Button)`
  width: 100%;
  height: auto;
  padding: 0.5rem 0.6rem;
  border-width: 0.1rem;
`;

export const StyledSwitchCardButton = styled(SwitchCardButton)<ISwitchCardButtonProps>`
  border-left-width: ${props => props.removeBorder && '0'};
  border-radius: 0;
`;

const StickyBox = styled(Box)<{ userSignedIn: boolean }>`
  position: sticky;
  top: ${props => (props.userSignedIn ? '3rem' : '6rem')};
  background-color: ${props => props.theme.colors.cardBackground};
  z-index: 999;
`;

export enum TAB_TOOLBAR_TYPE {
  SLIM,
  WIDE,
}

const SwitchCard: React.FC<ISwitchCard> = props => {
  const {
    count,
    loggedUser,
    activeButton,
    hasIcon = false,
    countLabel,
    tabButtons,
    buttonValues,
    hasMobileDesign,
    onIconClick,
    onTabClick,
    buttonsWrapperWidth,
    style,
    className,
    tabForm = TAB_TOOLBAR_TYPE.SLIM,
  } = props;

  const length = buttonValues.length;

  const shouldRenderSlimToolbar =
    !(isMobileOnly && hasMobileDesign) && tabForm !== TAB_TOOLBAR_TYPE.WIDE;

  return (
    <>
      {shouldRenderSlimToolbar && (
        <BasicCardBox margin={{ bottom: 'medium' }} style={style} className={className}>
          <Box direction="row" pad="1rem" justify="between" align="center">
            <Box direction="row">
              {hasIcon && (
                <Box margin={{ right: '1.25rem' }}>
                  <Icon
                    size="sm"
                    type="arrowLeft"
                    color="secondaryText"
                    clickable={true}
                    onClick={onIconClick}
                  />
                </Box>
              )}
              <Text size="large">{`${count} ${countLabel}`}</Text>
            </Box>
            <Box
              direction="row"
              width={
                isMobileOnly && buttonsWrapperWidth
                  ? buttonsWrapperWidth
                  : length > 3
                  ? '50%'
                  : length > 2
                  ? '33%'
                  : '30%'
              }
            >
              {tabButtons}
            </Box>
          </Box>
        </BasicCardBox>
      )}
      {!shouldRenderSlimToolbar && (
        <StickyBox
          userSignedIn={!!loggedUser}
          direction="row"
          className={className}
          style={style}
          margin={{ bottom: 'medium' }}
        >
          {buttonValues.map((el: { value: string; label: string }, idx: number) => (
            <Box
              key={idx}
              basis="full"
              pad={{ vertical: '0.5rem', horizontal: '0.6rem' }}
              border={
                el.value === activeButton
                  ? {
                      color: 'accent',
                      side: 'bottom',
                    }
                  : {
                      color: 'border',
                      side: 'bottom',
                    }
              }
              onClick={onTabClick(buttonValues[idx].value)}
            >
              <Text
                color={el.value === activeButton ? 'accentText' : 'secondaryText'}
                textAlign="center"
              >
                {el.label}
              </Text>
            </Box>
          ))}
        </StickyBox>
      )}
    </>
  );
};

export const TabsToolbar = styled(SwitchCard)<{ noMarginBottom?: boolean }>`
  font-synthesis: initial;
  ${props =>
    props.noMarginBottom &&
    css`
      margin-bottom: 0;
    `}
  ${StyledSwitchCardButton}:first-child {
    border-radius: 0.25rem 0rem 0rem 0.25rem;
  }
  ${StyledSwitchCardButton}:last-child {
    border-radius: 0rem 0.25rem 0.25rem 0rem;
  }
`;

export default SwitchCard;
