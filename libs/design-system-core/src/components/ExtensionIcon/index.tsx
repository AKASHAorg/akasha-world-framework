import React from 'react';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { Plugin, Widget } from '../Icon/akasha-icons';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export type ExtensionIconProps = {
  type: AkashaAppApplicationType;
  defaultIcon?: React.ReactElement;
};

const ExtensionIcon: React.FC<ExtensionIconProps> = props => {
  const { type, defaultIcon = <Squares2X2Icon /> } = props;

  switch (type) {
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

export default ExtensionIcon;
