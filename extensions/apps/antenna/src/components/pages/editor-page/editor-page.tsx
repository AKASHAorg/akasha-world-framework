import * as React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { useTranslation } from 'react-i18next';
import { Extension } from '@akashaorg/ui-lib-extensions/lib/react/extension';
import { useAkashaStore, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const EditorPage: React.FC<unknown> = () => {
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = React.useRef(getCorePlugins().routing.navigateTo);
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <Stack fullWidth={true}>
        <Helmet>
          <title>{t('Beam Editor')}</title>
        </Helmet>
        {!authenticatedDID && (
          <Stack>
            <ErrorLoader
              type={'not-authenticated'}
              title={t('Uh-oh! You are not connected!')}
              details={t('To create Beams you must be connected ⚡️')}
            >
              <Button
                label={t('Connect')}
                size="md"
                variant="primary"
                onClick={() =>
                  navigateTo.current({
                    appName: '@akashaorg/app-auth-ewa',
                    getNavigationUrl: navRoutes =>
                      `${navRoutes.Connect}?redirectTo=${encodeURIComponent(location.pathname)}`,
                  })
                }
              />
            </ErrorLoader>
          </Stack>
        )}
        {authenticatedDID && (
          <Stack customStyle="mb-1">
            <Extension name="beam-editor_feed_page" />
          </Stack>
        )}
      </Stack>
    </HelmetProvider>
  );
};

export default EditorPage;
