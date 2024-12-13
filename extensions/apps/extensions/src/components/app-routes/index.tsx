import React, { Suspense } from 'react';
import {
  createRoute,
  createRouter,
  redirect,
  CatchBoundary,
  defer,
  Await,
} from '@tanstack/react-router';
import { ICreateRouter, IRootComponentProps } from '@akashaorg/typings/lib/ui';
import {
  ExplorePage,
  ExtensionsHubPage,
  InstalledExtensionsPage,
  MyExtensionsPage,
  DeveloperModePage,
  DevMode,
  ExtensionCreationPage,
  PostExtensionCreationPage,
  InstallExtensionPage,
} from '../pages';
import { ExtensionPublishPage } from '../pages/extension-publish-page';
import {
  ExtensionReleaseManagerPage,
  EditTestReleasePage,
  ExtensionReleasePublishPage,
  ExtensionReleaseInfoPage,
} from '../pages/extension-release-manager';
import { PostPublishPage } from '../pages/post-publish-page';

import { DEV_MODE_KEY, ExtSearch, ExtType } from '../../constants';
import { ExtensionInstallTerms } from '../pages/install-extension/install-terms-conditions';
import { NotFoundComponent } from './not-found-component';
import { RouteErrorComponent } from './error-component';
import { rootRoute } from '../root-route';
import infoRoutes from '../pages/info-page/routes';
import editLocalExtRoutes from '../pages/extension-edit-page/routes';
import { EditPublishedExtensionPage } from '../pages/extension-edit-published-page/edit-published-extension-page';
import { ExtensionEditPublishedMainPage } from '../pages/extension-edit-published-page/main-page';
import { ExtensionGalleryManagerPage } from '../pages/extension-edit-page';
import { getExtensionById } from './data-loaders';
import {
  selectApplicationType,
  selectAppName,
  selectAppDisplayName,
  selectAppLogoImage,
  selectAppDescription,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-id-query';

const defaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/explore', replace: true });
  },
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: () => (
    <CatchBoundary getResetKey={() => 'explore_reset'} errorComponent={RouteErrorComponent}>
      <ExplorePage />
    </CatchBoundary>
  ),
});

const extensionsHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extensions-hub',
  component: ExtensionsHubPage,
});

const installedExtensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/installed-extensions',
  component: () => (
    <CatchBoundary getResetKey={() => 'installed_reset'} errorComponent={RouteErrorComponent}>
      <InstalledExtensionsPage />
    </CatchBoundary>
  ),
});

const myExtensionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-extensions',
  beforeLoad: () => {
    if (window.localStorage.getItem(DEV_MODE_KEY) !== DevMode.ENABLED) {
      throw redirect({ to: '/explore', replace: true });
    }
  },
  component: () => (
    <CatchBoundary getResetKey={() => 'my_extensions_reset'} errorComponent={RouteErrorComponent}>
      <MyExtensionsPage />
    </CatchBoundary>
  ),
});

const developerModeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/developer-mode',
  component: () => (
    <CatchBoundary getResetKey={() => 'dev_mode_reset'} errorComponent={RouteErrorComponent}>
      <DeveloperModePage />
    </CatchBoundary>
  ),
});

const extensionInstallRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/install/$appId',
  notFoundComponent: () => <NotFoundComponent />,
});

const extensionInstallIndexRoute = createRoute({
  getParentRoute: () => extensionInstallRootRoute,
  path: '/',
  beforeLoad: ({ navigate }) => {
    navigate({ to: extensionInstallTermsRoute.path, replace: true }).catch(e =>
      console.error('failed to navigate', e),
    );
  },
});

const extensionInstallTermsRoute = createRoute({
  getParentRoute: () => extensionInstallRootRoute,
  path: '/terms',
  component: () => {
    const { appId } = extensionInstallRootRoute.useParams();
    return <ExtensionInstallTerms appId={appId} />;
  },
});

const extensionInstallRoute = createRoute({
  getParentRoute: () => extensionInstallRootRoute,
  path: '/progress',
  component: () => {
    const { appId } = extensionInstallRootRoute.useParams();
    return <InstallExtensionPage appId={appId} />;
  },
});

const extensionCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-extension',
  component: () => {
    return <ExtensionCreationPage />;
  },
});

const postExtensionCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-extension/$extensionId',
  component: () => {
    const { extensionId } = postExtensionCreateRoute.useParams();
    return <PostExtensionCreationPage extensionId={extensionId} />;
  },
});

const extensionEditPublishedMainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/edit-published-extension/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionEditPublishedMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_edit_published_main_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditPublishedMainPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});
const extensionEditPublishedFormRoute = createRoute({
  getParentRoute: () => extensionEditPublishedMainRoute,
  path: `/form`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionEditPublishedFormRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_published_extension_reset'}
        errorComponent={RouteErrorComponent}
      >
        <EditPublishedExtensionPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const galleryManagerPublishedExtRoute = createRoute({
  getParentRoute: () => extensionEditPublishedMainRoute,
  path: '/gallery-manager',
  validateSearch: (search: Record<string, unknown>): ExtSearch => {
    return { type: search.type as ExtType };
  },
  component: () => {
    const from = galleryManagerPublishedExtRoute.useSearch();
    const { extensionId } = extensionEditPublishedMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_gallery_manager_published_ext_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionGalleryManagerPage type={from.type} extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionPublishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/publish-extension/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionPublishRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'publish_extension_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionPublishPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionReleaseManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/release-manager/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  loader: ({ params }) => {
    const { extensionId } = params;
    if (!extensionId) {
      throw new Error('extensionId is required');
    }
    return {
      extensionByIdReq: defer(getExtensionById(extensionId)),
    };
  },
  component: () => {
    const { extensionId } = extensionReleaseManagerRoute.useParams();
    const { extensionByIdReq } = extensionReleaseManagerRoute.useLoaderData();
    return (
      <CatchBoundary
        getResetKey={() => 'release_manager_reset'}
        errorComponent={RouteErrorComponent}
      >
        <Suspense>
          <Await promise={extensionByIdReq}>
            {req => (
              <ExtensionReleaseManagerPage
                extensionId={extensionId}
                networkStatus={req?.networkStatus}
                extensionDataReqErr={req?.error}
                extensionDataReqLoading={req?.loading}
                extensionName={selectAppName(req?.data)}
                extensionDisplayName={selectAppDisplayName(req?.data)}
                extensionApplicationType={selectApplicationType(req?.data)}
                extensionDescription={selectAppDescription(req?.data)}
                extensionLogoImage={selectAppLogoImage(req?.data)}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const releasePublishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/release-manager/$extensionId/publish-release`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = releasePublishRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'publish_release_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionReleasePublishPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const editTestReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/release-manager/$extensionId/edit-test-release`,
  notFoundComponent: () => <NotFoundComponent />,
  loader: ({ params }) => {
    const { extensionId } = params;
    if (!extensionId) {
      throw new Error('extensionId is required');
    }
    return {
      extensionByIdReq: defer(getExtensionById(extensionId)),
    };
  },
  component: () => {
    const { extensionId } = editTestReleaseRoute.useParams();
    const { extensionByIdReq } = editTestReleaseRoute.useLoaderData();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_test_release_reset'}
        errorComponent={RouteErrorComponent}
      >
        <Suspense>
          <Await promise={extensionByIdReq}>
            {req => (
              <EditTestReleasePage
                networkStatus={req?.networkStatus}
                extensionName={selectAppName(req?.data)}
                extensionType={selectApplicationType(req?.data)}
                extensionId={extensionId}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const releaseInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/release-manager/$extensionId/release-info/$releaseId`,
  notFoundComponent: () => <NotFoundComponent />,
  loader: ({ params }) => {
    const { extensionId } = params;
    if (!extensionId) {
      throw new Error('extensionId is required');
    }
    return {
      extensionByIdReq: defer(getExtensionById(extensionId)),
    };
  },
  component: () => {
    const { extensionId, releaseId } = releaseInfoRoute.useParams();
    const { extensionByIdReq } = releaseInfoRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'release_info_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={extensionByIdReq}>
            {req => (
              <ExtensionReleaseInfoPage
                extensionId={extensionId}
                networkStatus={req?.networkStatus}
                extensionName={selectAppName(req?.data)}
                extensionDisplayName={selectAppDisplayName(req?.data)}
                extensionApplicationType={selectApplicationType(req?.data)}
                extensionDescription={selectAppDescription(req?.data)}
                extensionLogoImage={selectAppLogoImage(req?.data)}
                releaseId={releaseId}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const postPublishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/post-publish/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return (
      <CatchBoundary getResetKey={() => 'post_publish_reset'} errorComponent={RouteErrorComponent}>
        <PostPublishPage />
      </CatchBoundary>
    );
  },
});

const routeTree = rootRoute.addChildren([
  defaultRoute,
  exploreRoute,
  extensionsHubRoute,
  installedExtensionsRoute,
  myExtensionsRoute,
  developerModeRoute,
  infoRoutes,
  editLocalExtRoutes,
  extensionInstallRootRoute.addChildren([
    extensionInstallIndexRoute,
    extensionInstallTermsRoute,
    extensionInstallRoute,
  ]),
  extensionCreateRoute,
  postExtensionCreateRoute,
  extensionEditPublishedMainRoute.addChildren([
    extensionEditPublishedFormRoute,
    galleryManagerPublishedExtRoute,
  ]),
  extensionPublishRoute,
  extensionReleaseManagerRoute,
  releasePublishRoute,
  editTestReleaseRoute,
  releaseInfoRoute,
  postPublishRoute,
]);

export const router = ({
  baseRouteName,
  apolloClient,
  decodeAppName,
  plugins,
}: ICreateRouter & {
  decodeAppName: IRootComponentProps['decodeAppName'];
  plugins: IRootComponentProps['plugins'];
}) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
      decodeAppName,
      plugins,
    },
    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
