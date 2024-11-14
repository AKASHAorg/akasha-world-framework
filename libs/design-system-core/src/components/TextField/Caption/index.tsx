import React, { PropsWithChildren } from 'react';
import Icon from '../../Icon';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '../../Icon/hero-icons-outline';
import Text from '../../Text';
import Stack from '../../Stack';
import { Color, Status } from '../../types/common.types';
import { CaptionProps } from '../types';
import { getIconClasses } from '../utils/get-icon-classes';

const Caption: React.FC<PropsWithChildren<CaptionProps>> = ({
  justifyContents = 'start',
  status,
  children,
}) => {
  const iconStyle = getIconClasses(status);
  const textColor: Color = status
    ? status
    : {
        light: 'grey4',
        dark: 'grey6',
      };

  return (
    <Stack direction="row" align="center" spacing="gap-1.5" justify={justifyContents}>
      {status && <Icon icon={STATUS_TO_ICON_MAP[status]} color={iconStyle} />}
      <Text color={textColor} variant="footnotes2" weight="normal">
        {children}
      </Text>
    </Stack>
  );
};

const STATUS_TO_ICON_MAP: Record<Status, React.ReactElement> = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  warning: <ExclamationTriangleIcon />,
};

export default Caption;
