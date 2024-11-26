import 'systemjs-webpack-interop/auto-public-path';
import * as singleSpa from 'single-spa';
import {
  MenuItemAreaType,
  NavigateToParams,
  IMenuItem,
  IRoutingPlugin,
  RouteRepository,
} from '@akashaorg/typings/lib/ui';
import { ILogger } from '@akashaorg/typings/lib/sdk/log';

export class RoutingPlugin implements IRoutingPlugin {
  #routeRepository: RouteRepository;
  readonly #logger: ILogger;
  static #instance: RoutingPlugin;
  #changeListeners: (() => void)[];
  private constructor(logger: ILogger) {
    this.#routeRepository = {
      all: {},
      activeExtensionsNames: {},
      byArea: Object.values(MenuItemAreaType).reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    };
    this.#logger = logger;
    this.#changeListeners = [];
  }
  /**
   * Get singleton instance
   **/
  static getInstance(logger: ILogger) {
    if (!this.#instance) {
      this.#instance = new RoutingPlugin(logger);
      this.#instance.#listenEvents();
    }
    return this.#instance;
  }

  #listenEvents = () => {
    window.addEventListener('single-spa:before-app-change', (e: CustomEvent) => {
      if (e.detail?.appsByNewStatus?.MOUNTED?.length) {
        this.#routeRepository = {
          ...this.#routeRepository,
          activeExtensionsNames: e.detail?.appsByNewStatus?.MOUNTED.reduce(
            (acc: { apps: string[]; widgets: string[] }, appName: string) => {
              if (this.#routeRepository.all[appName]) {
                acc.apps = [...acc.apps, appName];
              } else {
                acc.widgets = [...acc.widgets, appName];
              }
              return acc;
            },
            { apps: [], widgets: [] },
          ),
        };
        this.#changeListeners.forEach(listener => listener());
      }
    });
  };

  #addRouteToRepository = (
    name: string,
    menuItem: IMenuItem,
    navRoutes: Record<string, string>,
  ) => {
    const appMenuItemData = {
      ...menuItem,
      navRoutes: navRoutes,
      name: name,
    };

    this.#routeRepository = {
      ...this.#routeRepository,
      all: {
        ...this.#routeRepository.all,
        [name]: appMenuItemData,
      },
    };
    menuItem?.area?.forEach(
      (menuArea: MenuItemAreaType) =>
        (this.#routeRepository = {
          ...this.#routeRepository,
          byArea: {
            ...this.#routeRepository.byArea,
            [menuArea]: this.#routeRepository.byArea[menuArea].concat(appMenuItemData),
          },
        }),
    );
  };

  registerRoute = (routeData: {
    name: string;
    menuItems?: IMenuItem | IMenuItem[];
    navRoutes?: Record<string, string>;
  }) => {
    if (this.#routeRepository.all[routeData.name]) {
      return;
    }
    if (Array.isArray(routeData.menuItems)) {
      routeData.menuItems.forEach(menuItem => {
        this.#addRouteToRepository(routeData.name, menuItem, routeData.navRoutes);
      });
      this.#changeListeners.forEach(listener => listener());
    } else {
      this.#addRouteToRepository(routeData.name, routeData.menuItems, routeData.navRoutes);
      this.#changeListeners.forEach(listener => listener());
    }
  };

  unregisterRoute = (extensionName: string) => {
    const repo = { ...this.#routeRepository };

    delete repo.all[extensionName];
    delete repo.activeExtensionsNames[extensionName];

    for (const area in repo.byArea) {
      if (repo.byArea.hasOwnProperty(area)) {
        repo.byArea[area] = repo.byArea[area].filter(menuItem => menuItem.name !== extensionName);
      }
    }

    this.#routeRepository = repo;
    this.#changeListeners.forEach(listener => listener());
  };

  navigateTo = ({ appName, getNavigationUrl }: NavigateToParams, replace?: boolean) => {
    const app = this.#routeRepository.all[appName];
    let url: string;

    if (getNavigationUrl) {
      try {
        url = getNavigationUrl(app?.navRoutes);
      } catch (err) {
        this.#logger.error(
          `Path not found! Tried to find a path for application: ${appName}. Defaulting to rootRoute!`,
        );
      }
    }
    if (!url) {
      url = '/';
    }

    const targetUrl = `/${appName}${url}`;
    // no need to navigate because the paths are the same
    if (targetUrl === location.pathname && !location.search) {
      return;
    }

    if (replace) {
      window.history.replaceState(null, null, targetUrl);
    } else {
      singleSpa.navigateToUrl(targetUrl);
    }
  };

  getUrlForApp = ({ appName, getNavigationUrl }: NavigateToParams) => {
    const app = this.#routeRepository.all[appName];
    let url = '';
    if (getNavigationUrl) {
      try {
        url = getNavigationUrl(app?.navRoutes);
      } catch (err) {
        this.#logger.error(
          `Path not found! Tried to find a path for application: ${appName}. Defaulting to rootRoute!`,
        );
        url = undefined;
      }
    }

    if (!url === undefined) {
      url = '/';
    }

    return `/${appName}${url}`;
  };
  /**
   * handle redirections from search params
   * if redirectTo is found in the search param then it will redirect to that path
   * otherwise will use the fallback object {@link NavigateToParams}
   * @example
   * ```
   *  handleRedirect({
   *     search: new URLSearchParam(location.search),
   *     fallBack: {
   *       appName: '@akashaorg/app-lists',
   *       getNavigationUrl: (routes) => routes.someRoute
   *     }
   *  });
   * ```
   */

  handleRedirect = (options: { search: URLSearchParams; fallback: NavigateToParams }) => {
    const redirectTo = options.search.get('redirectTo');
    if (redirectTo) {
      // appName is at index 1 in "/@akashaorg/app-name/some-path"
      const [, appName, ...path] = redirectTo.split('/');
      return this.navigateTo({
        appName,
        getNavigationUrl: () => {
          return `/${path.join('/')}`;
        },
      });
    }
    return this.navigateTo(options.fallback);
  };
  /**
   * Subscribe to changes. When using in React, it's recommended to be used with useSyncExternalStore
   **/
  subscribe = (listener: () => void) => {
    this.#changeListeners.push(listener);
    return () => {
      this.#changeListeners.filter(cb => cb !== listener);
    };
  };
  // make it useSyncExternalStore friendly
  getSnapshot = () => {
    return this.#routeRepository;
  };
}
