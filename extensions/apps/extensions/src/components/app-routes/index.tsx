import React, { Suspense } from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  CatchBoundary,
  defer,
  Await,
} from '@tanstack/react-router';
import { ICreateRouter, IRootComponentProps, IRouterContext } from '@akashaorg/typings/lib/ui';
import {
  ExplorePage,
  ExtensionsHubPage,
  InfoPage,
  InstalledExtensionsPage,
  MyExtensionsPage,
  DeveloperModePage,
  DevMode,
  ExtensionCreationPage,
  PostExtensionCreationPage,
  InstallExtensionPage,
} from '../pages';
import {
  ExtensionEditMainPage,
  ExtensionEditStep1Page,
  ExtensionEditStep2Page,
  ExtensionEditStep3Page,
  ExtensionEditContributorsPage,
  ExtensionGalleryManagerPage,
} from '../pages/extension-edit-page';
import { ExtensionPublishPage } from '../pages/extension-publish-page';
import {
  ExtensionReleaseManagerPage,
  EditTestReleasePage,
  ExtensionReleasePublishPage,
  ExtensionReleaseInfoPage,
} from '../pages/extension-release-manager';
import { PostPublishPage } from '../pages/post-publish-page';
import {
  DevInfoPage,
  CollaboratorsPage,
  VersionInfoPage,
  VersionHistoryPage,
  AuditLogPage,
  PermissionsPage,
  LicensePage,
  AppDescriptionPage,
} from '../pages/info-page/sub-pages';
import { DEV_MODE_KEY } from '../../constants';
import { ExtensionInstallTerms } from '../pages/install-extension/install-terms-conditions';
import { NotFoundComponent } from './not-found-component';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { getExtensionById } from './data-loaders';
import {
  selectExtensionCollaborators,
  selectExtensionDescription,
  selectExtensionDisplayName,
  selectExtensionLicense,
  selectExtensionLogo,
  selectExtensionName,
  selectExtensionType,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-query';

const RouteErrorComponent = () => (
  <ErrorLoader
    type="script-error"
    title="Oops, this page returned an error :("
    details="There is an error somewhere in this page and we need to display this card to avoid other issues."
  />
);

const rootRoute = createRootRouteWithContext<
  IRouterContext & {
    decodeAppName: IRootComponentProps['decodeAppName'];
  }
>()({
  component: Outlet,
  notFoundComponent: () => <NotFoundComponent />,
});

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
const infoRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/info/$appId',
  component: () => <Outlet />,
});

const infoIndexRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/',
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { appId } = infoRootRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'app_info_root_reset'} errorComponent={RouteErrorComponent}>
        <InfoPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const devInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/developer/$devDid',
  component: () => {
    const { devDid } = devInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'dev_info_root_reset'} errorComponent={RouteErrorComponent}>
        <DevInfoPage devDid={devDid} />
      </CatchBoundary>
    );
  },
});

const collaboratorsInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/collaborators',
  loader: ({ context, params }) => {
    const { appId } = params;
    if (!appId) {
      throw new Error('appId is required');
    }
    return {
      extensionById: defer(getExtensionById(context.decodeAppName(appId))),
    };
  },
  component: () => {
    const { appId } = infoRootRoute.useParams();
    const { extensionById } = collaboratorsInfoRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'collaborators_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={extensionById}>
            {data => (
              <CollaboratorsPage
                extensionLogo={selectExtensionLogo(data)}
                extensionName={selectExtensionName(data)}
                extensionDisplayName={selectExtensionDisplayName(data)}
                collaborators={selectExtensionCollaborators(data)}
                extensionType={selectExtensionType(data)}
                appId={appId}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const versionInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/versions',
  component: () => {
    const { appId } = infoRootRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'app_info_root_reset'} errorComponent={RouteErrorComponent}>
        <VersionInfoPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const versionHistoryRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/version-history',
  component: () => {
    const { appId } = versionHistoryRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'version_history_reset'}
        errorComponent={RouteErrorComponent}
      >
        <VersionHistoryPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const auditLogRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/audit-log',
  component: () => {
    const { appId } = auditLogRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'audit_log_reset'} errorComponent={RouteErrorComponent}>
        <AuditLogPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const permissionInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/permissions',
  component: () => {
    const { appId } = permissionInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'permissions_reset'} errorComponent={RouteErrorComponent}>
        <PermissionsPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const appLicenseInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/license',
  loader: ({ context, params }) => {
    const { appId } = params;
    if (!appId) {
      throw new Error('appId is required');
    }
    return {
      extensionById: defer(getExtensionById(context.decodeAppName(appId))),
    };
  },
  component: () => {
    const { appId } = appLicenseInfoRoute.useParams();
    const { extensionById } = appLicenseInfoRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'license_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={extensionById}>
            {data => (
              <LicensePage
                appId={appId}
                extensionLogo={selectExtensionLogo(data)}
                extensionDisplayName={selectExtensionDisplayName(data)}
                extensionName={selectExtensionName(data)}
                license={selectExtensionLicense(data)}
                extensionType={selectExtensionType(data)}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const appDescriptionRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/description',
  loader: ({ context, params }) => {
    const { appId } = params;
    if (!appId) {
      throw new Error('appId is required');
    }
    return {
      extensionById: defer(getExtensionById(context.decodeAppName(appId))),
    };
  },
  component: () => {
    const { appId } = infoRootRoute.useParams();
    const { extensionById } = appDescriptionRoute.useLoaderData();
    return (
      <Suspense>
        <Await promise={extensionById}>
          {data => {
            return (
              <AppDescriptionPage
                appId={appId}
                extensionLogo={selectExtensionLogo(data)}
                extensionName={selectExtensionName(data)}
                extensionDisplayName={selectExtensionDisplayName(data)}
                description={selectExtensionDescription(data)}
                extensionType={selectExtensionType(data)}
              />
            );
          }}
        </Await>
      </Suspense>
    );
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

const extensionEditMainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/edit-extension/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_main_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditMainPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionEditStep1Route = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/step1',
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_step1_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditStep1Page extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});
const extensionEditStep2Route = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/step2',
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_step2_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditStep2Page extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});
const galleryManagerRoute = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/gallery-manager',
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_gallery_manager_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionGalleryManagerPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});
const extensionEditStep3Route = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/step3',
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_step3_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditStep3Page extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionEditContributorsRoute = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/contributors',
  component: () => {
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_contributors_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionEditContributorsPage extensionId={extensionId} />
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
  component: () => {
    const { extensionId } = extensionReleaseManagerRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'release_manager_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionReleaseManagerPage extensionId={extensionId} />
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
  component: () => {
    const { extensionId } = editTestReleaseRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_test_release_reset'}
        errorComponent={RouteErrorComponent}
      >
        <EditTestReleasePage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const releaseInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/release-manager/$extensionId/release-info/$releaseId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId, releaseId } = releaseInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'release_info_reset'} errorComponent={RouteErrorComponent}>
        <ExtensionReleaseInfoPage extensionId={extensionId} releaseId={releaseId} />
      </CatchBoundary>
    );
  },
});

type SubmitSearch = { type: SubmitType };

export enum SubmitType {
  EXTENSION = 'extension',
  RELEASE = 'release',
}

const postPublishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/post-publish/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  validateSearch: (search: Record<string, unknown>): SubmitSearch => {
    return { type: search.type as SubmitType };
  },
  component: () => {
    const from = postPublishRoute.useSearch();
    const { extensionId } = postPublishRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'post_publish_reset'} errorComponent={RouteErrorComponent}>
        <PostPublishPage type={from.type} extensionId={extensionId} />
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
  infoRootRoute.addChildren([
    infoIndexRoute,
    devInfoRoute,
    collaboratorsInfoRoute,
    versionInfoRoute,
    versionHistoryRoute,
    auditLogRoute,
    permissionInfoRoute,
    appLicenseInfoRoute,
    appDescriptionRoute,
  ]),
  extensionInstallRootRoute.addChildren([
    extensionInstallIndexRoute,
    extensionInstallTermsRoute,
    extensionInstallRoute,
  ]),
  extensionCreateRoute,
  postExtensionCreateRoute,
  extensionEditMainRoute.addChildren([
    extensionEditStep1Route,
    extensionEditStep2Route,
    extensionEditStep3Route,
    extensionEditContributorsRoute,
    galleryManagerRoute,
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
}: ICreateRouter & { decodeAppName: IRootComponentProps['decodeAppName'] }) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
      decodeAppName,
    },
    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
