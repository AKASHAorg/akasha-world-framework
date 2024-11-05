import React from 'react';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { Plugin, Widget } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export type IconByTypeProps = {
  type: AkashaAppApplicationType;
  defaultIcon?: React.ReactElement;
};

const IconByAppType: React.FC<IconByTypeProps> = props => {
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

export default IconByAppType;
