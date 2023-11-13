import * as React from 'react';
import singleSpaReact from 'single-spa-react';
import ReactDOM from 'react-dom';
import { RootExtensionProps, AnalyticsCategories } from '@akashaorg/typings/lib/ui';
import { I18nextProvider, useTranslation } from 'react-i18next';
import {
  useAnalytics,
  withProviders,
  validateType,
  useRootComponentProps,
} from '@akashaorg/ui-awf-hooks';
import { useGetMyProfileQuery } from '@akashaorg/ui-awf-hooks/lib/generated';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';

type MessageButtonExtensionData = {
  profileId: string;
};

const MessageButton: React.FC<RootExtensionProps<MessageButtonExtensionData>> = props => {
  const { extensionData } = props;
  const { getRoutingPlugin } = useRootComponentProps();
  const { t } = useTranslation('app-messaging');

  const [analyticsActions] = useAnalytics();

  const { profileId } = extensionData;

  const profileDataReq = useGetMyProfileQuery(null, {
    select: resp => {
      return resp.viewer?.akashaProfile;
    },
  });
  const loggedProfileData = profileDataReq.data;

  const contactsToCheck = [];
  if (validateType(profileId, 'string')) {
    contactsToCheck.push(profileId);
  }

  const isContactReq = null;
  const contactList = isContactReq?.data;

  const isContact = React.useMemo(() => {
    return contactList.includes(profileId as string);
  }, [contactList, profileId]);

  const handleClick = () => {
    analyticsActions.trackEvent({
      category: AnalyticsCategories.MESSAGING,
      action: 'message-button-click',
    });

    getRoutingPlugin().navigateTo?.({
      appName: '@akashaorg/app-messaging',
      getNavigationUrl: routes => `${routes.chat}/${profileId}`,
    });
  };

  if (profileId === loggedProfileData?.did.id) {
    return;
  }

  return (
    <>
      <Button
        icon="EnvelopeIcon"
        label={t('Message')}
        onClick={handleClick}
        disabled={!isContact}
        customStyle="w-full"
      />
    </>
  );
};

const MessageButtonWrapper = (props: RootExtensionProps<MessageButtonExtensionData>) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      <MessageButton {...props} />
    </I18nextProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient: ReactDOM,
  rootComponent: withProviders(MessageButtonWrapper),
  errorBoundary: (err, errorInfo, props: RootExtensionProps<MessageButtonExtensionData>) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return <Icon type="ExclamationCircleIcon" />;
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = () => Promise.resolve();
