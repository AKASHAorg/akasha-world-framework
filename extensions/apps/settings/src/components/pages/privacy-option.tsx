import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@akashaorg/design-system-core/lib/components/Button';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';

import PageLayout from './base-layout';

import {
  useRootComponentProps,
  COOKIE_CONSENT_NAME,
  CookieConsentTypes,
} from '@akashaorg/ui-core-hooks';
import { EventTypes, UIEventData } from '@akashaorg/typings/lib/ui';

const PrivacyOption: React.FC = () => {
  const { t } = useTranslation('app-settings-ewa');

  const [cookieType, setCookieType] = useState(window.localStorage.getItem(COOKIE_CONSENT_NAME));

  const [checkedTracking, setCheckedTracking] = useState<boolean>(
    cookieType === CookieConsentTypes.ALL,
  );

  const { uiEvents, getCorePlugins } = useRootComponentProps();
  const routingPlugin = useRef(getCorePlugins().routing);
  const uiEventsRef = useRef(uiEvents);

  useEffect(() => {
    const eventsSub = uiEventsRef.current.subscribe({
      next: (eventInfo: UIEventData) => {
        // listen to set initial cookie type event when fired
        if (eventInfo.event === EventTypes.SetInitialCookieType) {
          // check for cookie type
          const _cookieType = window.localStorage.getItem(COOKIE_CONSENT_NAME);

          // if all cookies allowed, toggle checked tracking
          if (_cookieType === CookieConsentTypes.ALL) {
            setCheckedTracking(true);
          }

          setCookieType(_cookieType);
        }
      },
    });

    return () => {
      if (eventsSub) {
        eventsSub.unsubscribe();
      }
    };
  }, []);

  const handlePrivacyPolicyClick = () => {
    routingPlugin.current?.navigateTo?.({
      appName: '@akashaorg/app-legal',
      getNavigationUrl: navRoutes => navRoutes.privacyPolicy,
    });
  };

  const handleLegalAppNav = () => {
    routingPlugin.current?.navigateTo?.({
      appName: '@akashaorg/app-legal',
      getNavigationUrl: navRoutes => navRoutes.legal,
    });
  };

  const handleTrackingOptionChange = event => {
    setCheckedTracking(event.target.checked);
    if (cookieType) {
      if (event.target.checked) {
        if (cookieType === CookieConsentTypes.ESSENTIAL) {
          window.localStorage.setItem(COOKIE_CONSENT_NAME, CookieConsentTypes.ALL);
          if (window['_paq']) {
            window['_paq'].push(['forgetUserOptOut']);
          }
        }
      } else {
        window.localStorage.setItem(COOKIE_CONSENT_NAME, CookieConsentTypes.ESSENTIAL);
        if (window['_paq']) {
          window['_paq'].push(['optUserOut']);
        }
      }
    }
  };

  return (
    <PageLayout title={t('Privacy')}>
      <Stack padding="px-4">
        {/* essential cookies */}
        <Stack padding="py-4" customStyle="border(b-1 solid grey8 dark:grey5)">
          <Stack direction="row" justify="between" align="center" customStyle="mb-2">
            <Text weight="bold">{t('Essential Cookies')}</Text>

            {/* always checked and cannot be toggled */}
            <Toggle checked={true} disabled={true} />
          </Stack>

          <Text>
            {t(
              "We've gotta have essential cookies. The clue's in the name. They're essential to initiating your experience of ",
            )}
            <Text customStyle="inline-block" as="span" weight="bold">
              {'AKASHA World'}
            </Text>
            {t(
              " and keeping it secure, stable, and optimized, so you'll feel like this is your kind of thing — to use, celebrate, and grow. If you're a privacy geek like us, you'll find ",
            )}
            <Button
              size="lg"
              variant="text"
              label={t('our privacy policy')}
              onClick={handlePrivacyPolicyClick}
            />
            {t(' makes for perfect bedtime reading. ')}
            {t(
              "The best thing is that when we write “our app” and “our Privacy Policy”, that means “your app” and “your Privacy Policy” because we're doing this together.",
            )}
          </Text>
        </Stack>

        {/* tracking analytics */}
        <Stack padding="py-4" customStyle="border(b-1 solid grey8 dark:grey5)">
          <Stack direction="row" justify="between" align="center" customStyle="mb-2">
            <Text weight="bold">{t('Tracking and Analytics')}</Text>

            <Toggle
              checked={checkedTracking}
              onChange={handleTrackingOptionChange}
              disabled={!cookieType}
            />
          </Stack>

          <Text>
            {t(
              "As we've said ☝🏽, we're doing this together. If you want to contribute some insight into how ",
            )}
            <Text customStyle="inline-block" as="span" weight="bold">
              {'AKASHA World'}
            </Text>
            {t(
              ' is used so we can all work all the more brilliantly to improve it, you can opt-in to our own ',
            )}
            <Link target="_blank" to={'https://matomo.org'}>
              <Text
                as="span"
                weight="bold"
                color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
              >
                {'Matomo'}
              </Text>
            </Link>
            {t(
              " analytics. We don't store personal identifiable information (PII) and you can opt-out at any time. ",
            )}
            <Link
              target="_blank"
              to={
                'https://forum.akasha.org/t/implementing-analytics-on-ethereum-world-an-open-discussion-on-the-rationale-and-your-choices/100'
              }
            >
              <Text as="span" color={{ light: 'secondaryLight', dark: 'secondaryDark' }}>
                {t('Click here')}
              </Text>
            </Link>
            {t(' to learn more.')}
          </Text>
        </Stack>
        {/* legal notice */}
        <Stack padding="py-4">
          <Stack direction="row" justify="start" align="center" customStyle="mb-2">
            <Text weight="bold">{t('Legal and Terms of Use')}</Text>
          </Stack>
          <Text>
            {t("Discover more about AKASHA World's Legal and Terms of Use")}{' '}
            <Button plain={true} onClick={handleLegalAppNav}>
              <Text
                as="span"
                color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                align="center"
              >
                {t('here')}
              </Text>
            </Button>
          </Text>
        </Stack>
      </Stack>
    </PageLayout>
  );
};

export default PrivacyOption;
