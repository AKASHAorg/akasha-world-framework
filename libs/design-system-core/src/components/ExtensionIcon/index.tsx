import React from 'react';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import Icon, { IconProps } from '../Icon';
import { Plugin, Widget } from '../Icon/akasha-icons';

export type ExtensionIconProps = IconProps & {
  type: AkashaAppApplicationType;
  defaultIcon?: React.ReactElement;
};

const ExtensionIcon: React.FC<ExtensionIconProps> = props => {
  const {
    size = 'sm',
    solid = false,
    accentColor = true,
    type,
    defaultIcon = <Squares2X2Icon />,
  } = props;

  const getIconByType = (_type: AkashaAppApplicationType) => {
    switch (_type) {
      case AkashaAppApplicationType.App:
        return <Squares2X2Icon />;
      case AkashaAppApplicationType.Plugin:
        return <Plugin />;
      case AkashaAppApplicationType.Widget:
        return <Widget />;
      default:
        return defaultIcon;
    }
  };

  return (
    <Icon
      size={size}
      solid={
        [AkashaAppApplicationType.Plugin, AkashaAppApplicationType.Widget].includes(type) || solid
      }
      accentColor={accentColor}
      icon={getIconByType(type)}
    />
  );
};

export default ExtensionIcon;
