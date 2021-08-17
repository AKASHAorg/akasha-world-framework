import React, { PureComponent } from 'react';
import DS from '@akashaproject/design-system';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import Routes from './routes';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-chained-backend';
import Fetch from 'i18next-fetch-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

const { Box, Helmet } = DS;

class App extends PureComponent<RootComponentProps> {
  public state: { hasErrors: boolean };

  constructor(props: RootComponentProps) {
    super(props);
    this.state = {
      hasErrors: false,
    };
  }

  public componentDidCatch(err: Error, info: React.ErrorInfo) {
    this.setState({
      hasErrors: true,
    });
    const { logger } = this.props;
    logger.error(err, info);
  }
  public render() {
    const { logger } = this.props;

    if (this.state.hasErrors) {
      return <div>Oh no, something went wrong in {'search-plugin'}</div>;
    }

    i18next
      .use(initReactI18next)
      .use(Backend)
      .use(LanguageDetector)
      .use({
        type: 'logger',
        log: logger.info,
        warn: logger.warn,
        error: logger.error,
      })
      .init({
        fallbackLng: 'en',
        ns: ['ui-plugin-search'],
        saveMissing: false,
        saveMissingTo: 'all',
        load: 'languageOnly',
        debug: true,
        cleanCode: true,
        keySeparator: false,
        defaultNS: 'ui-plugin-search',
        backend: {
          backends: [LocalStorageBackend, Fetch],
          backendOptions: [
            {
              prefix: 'i18next_res_v0',
              expirationTime: 24 * 60 * 60 * 1000,
            },
            {
              loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
          ],
        },
      });

    return (
      <Box width="100vw">
        <React.Suspense fallback={<>Loading</>}>
          <I18nextProvider i18n={i18next}>
            <Helmet>
              <title>Search | Ethereum World</title>
            </Helmet>
            <Routes {...this.props} />
          </I18nextProvider>
        </React.Suspense>
      </Box>
    );
  }
}

export default App;
