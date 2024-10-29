import * as React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import {
  BoltIcon,
  ExclamationTriangleIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-awf-hooks';
import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import type { IRootComponentProps } from '@akashaorg/typings/lib/ui';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';

const LoginBoltButton = () => {
  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = React.useRef(getCorePlugins().routing.navigateTo);

  const onLoginClick = React.useCallback(() => {
    navigateTo.current({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: () => '/',
    });
  }, []);

  return (
    <Button
      iconOnly={true}
      icon={<BoltIcon />}
      onClick={onLoginClick}
      variant="primary"
      customStyle="md:invisible" // show only on mobile screens
    />
  );
};

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(LoginBoltButton),
  errorBoundary: (err, errorInfo, props: IRootComponentProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }
    return <Icon icon={<ExclamationTriangleIcon />} />;
  },
});
