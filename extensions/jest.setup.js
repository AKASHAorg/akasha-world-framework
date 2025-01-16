import twindConfig from '@akashaorg/design-system-core/src/twind/twind.config';
import * as useRootComponentProps from '@akashaorg/ui-core-hooks/lib/use-root-props';
import * as useAkashaStore from '@akashaorg/ui-core-hooks/lib/store/use-akasha-store';
import * as useAnalytics from '@akashaorg/ui-core-hooks/lib/use-analytics';
import { genAppProps, getUserInfo, getAuthenticationStore } from '@akashaorg/af-testing';
import { install } from '@twind/core';
import '@testing-library/jest-dom';

install(twindConfig);

class ResizeObserver {
  observe() {
    return;
  }
  unobserve() {
    return;
  }
  disconnect() {
    return;
  }
}

global.ResizeObserver = ResizeObserver;

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
  useRouterState: jest.fn().mockImplementation(() => {
    return {
      location: {
        pathname: '',
      },
    };
  }),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useMedia: jest.fn().mockImplementation(() => {
    return false;
  }),
}));

/**
 * sdk mock for Apps package.
 * Include only methods needed for the apps tests
 *
 */
jest.mock('@akashaorg/core-sdk', () => () => {
  const { ReplaySubject } = require('rxjs');
  return {
    api: {
      auth: {
        signIn: () => Promise.resolve({ data: { id: 'id' } }),
        signOut: () => Promise.resolve('Logged out'),
        getCurrentUser: () => Promise.resolve({ data: { id: 'id' } }),
        prepareIndexedID: () => ({
          jws: null,
          capability: null,
        }),
      },
      globalChannel: new ReplaySubject(),
    },
    services: {
      gql: {
        mutationNotificationConfig: { optionName: 'testMutationConfig' },
        labelTypes: {
          TAG: 'core#tag',
        },
        indexingDID: 'did:key:z3LkgiKkD9NLvLX5FwePrvzvRF2bLmYjDvrd8MbQ5w1VjJ7A',
        contextSources: {
          composeDB: Symbol.for('composeDB'),
          default: Symbol.for('defaultContextSource'),
        },
        getAPI: () => ({
          GetAppsByPublisherDID: () =>
            Promise.resolve({
              node: {
                akashaAppList: {
                  edges: [{ node: { id: 'id', releases: { edges: [{ node: { id: 'id' } }] } } }],
                },
              },
            }),
        }),
      },
      common: {
        misc: {
          resolveDID: jest.fn(),
        },
        ipfs: {
          buildIpfsLinks: hash => ({
            originLink: hash,
            fallbackLink: hash,
            pathLink: hash,
          }),
        },
      },
      stash: {
        getUiStash: () => new Map(),
      },
    },
  };
});

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        languages: [],
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

jest.spyOn(useRootComponentProps, 'useRootComponentProps').mockReturnValue({ ...genAppProps() });

jest.spyOn(useAnalytics, 'useAnalytics').mockReturnValue([{ trackEvent: jest.fn }]);

jest
  .spyOn(useAkashaStore, 'useAkashaStore')
  .mockReturnValue({ authenticationStore: getAuthenticationStore(), data: getUserInfo() });

const mockIntersectionObserver = jest.fn();

mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

global.IntersectionObserver = mockIntersectionObserver;

global.scrollTo = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: false,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'crypto', {
  writable: false,
  value: {
    randomUUID: () => Date.now(),
  },
});
