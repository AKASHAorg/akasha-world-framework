import React, { ReactElement } from 'react';
import Stack from '../Stack';
import Text from '../Text';
import Button from '../Button';
import Icon from '../Icon';
import { Color, Radius, Status } from '../types/common.types';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '../Icon/hero-icons-solid';
import { getRadiusClasses } from '../../utils';

type NotificationTypes = Status | 'info';

export type InlineNotificationProps = {
  dataTestId?: string;
  title?: string;
  message: string;
  type: NotificationTypes;
  borderRadius?: Radius;
  background?: Color;
  button?: {
    label: string;
    handleClick: () => void;
  };
  customStyle?: string;
};

/**
 * A InlineNotification component is useful for displaying simple notifications in an app
 * @param dataTestId - (optional) useful when writing test
 * @param title - (optional) title
 * @param message - message
 * @param borderRadius - border radius
 * @param type - type of notification
 * @param background - (optional) customize the background color
 * @param button - (optional) an object containing the label and click handler of a button
 * @param customStyle - (optional) apply your custom styling (Make sure to use standard Tailwind classes)
 * @example
 * ```tsx
 *     <InlineNotification message='A sample message...' type="error" />
 * ```
 **/
const InlineNotification: React.FC<InlineNotificationProps> = ({
  dataTestId,
  title,
  message,
  type,
  borderRadius = 10,
  background = { light: 'grey9', dark: 'grey3' },
  button,
  customStyle = '',
}) => {
  const borderRadiusStyle = borderRadius ? getRadiusClasses(borderRadius) : '';
  return (
    <Stack
      direction="row"
      spacing="gap-x-3"
      align="start"
      padding="p-3"
      background={background}
      dataTestId={dataTestId}
      customStyle={`${borderRadiusStyle} ${customStyle}`}
      fullWidth
    >
      <Stack customStyle="mt-1">{TYPE_ICON_MAP[type]}</Stack>
      <Stack align="start" spacing="gap-y-1">
        <Text variant="button-md">{title}</Text>
        <Text variant="body2" weight="normal">
          {message}
        </Text>
        {button && (
          <Button variant="text" size="md" label={button.label} onClick={button.handleClick} />
        )}
      </Stack>
    </Stack>
  );
};

const TYPE_ICON_MAP: Record<NotificationTypes, ReactElement> = {
  error: <Icon icon={<XCircleIcon />} color="error" solid />,
  warning: <Icon icon={<ExclamationTriangleIcon />} color="warning" solid />,
  success: <Icon icon={<CheckCircleIcon />} color="success" solid />,
  info: (
    <Icon
      icon={<InformationCircleIcon />}
      color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
      solid
    />
  ),
};

export default InlineNotification;
