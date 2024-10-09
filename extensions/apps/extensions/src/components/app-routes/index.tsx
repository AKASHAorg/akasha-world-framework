import React from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  CatchBoundary,
} from '@tanstack/react-router';
import { ICreateRouter, IRouterContext } from '@akashaorg/typings/lib/ui';
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
} from '../pages/extension-edit-page';
import { ExtensionSubmitPage } from '../pages/extension-submit-page';
import { ExtensionReleaseSubmitPage } from '../pages/release-submit-page';
import { PostSubmitPage } from '../pages/post-submit-page';
import {
  DevInfoPage,
  CollaboratorsPage,
  VersionInfoPage,
  VersionHistoryPage,
  AuditLogPage,
  PermissionsPage,
  LicensePage,
  ContactSupportPage,
  AppDescriptionPage,
} from '../pages/info-page/sub-pages';

import { DEV_MODE_KEY } from '../../constants';
import { ExtensionInstallTerms } from '../pages/install-extension/install-terms-conditions';
import { NotFoundComponent } from './not-found-component';

const rootRoute = createRootRouteWithContext<IRouterContext>()({
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
    <CatchBoundary getResetKey={() => 'explore_reset'} errorComponent={NotFoundComponent}>
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
    <CatchBoundary getResetKey={() => 'installed_reset'} errorComponent={NotFoundComponent}>
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
    <CatchBoundary getResetKey={() => 'my_extensions_reset'} errorComponent={NotFoundComponent}>
      <MyExtensionsPage />
    </CatchBoundary>
  ),
});

const developerModeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/developer-mode',
  component: () => (
    <CatchBoundary getResetKey={() => 'dev_mode_reset'} errorComponent={NotFoundComponent}>
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
      <CatchBoundary getResetKey={() => 'app_info_root_reset'} errorComponent={NotFoundComponent}>
        <InfoPage appId={appId} />
        <Outlet />
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
      <CatchBoundary getResetKey={() => 'dev_info_root_reset'} errorComponent={NotFoundComponent}>
        <DevInfoPage devDid={devDid} />
      </CatchBoundary>
    );
  },
});

const collaboratorsInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/collaborators',
  component: () => {
    const { appId } = infoRootRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'collaborators_reset'} errorComponent={NotFoundComponent}>
        <CollaboratorsPage appId={appId} />
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
      <CatchBoundary getResetKey={() => 'app_info_root_reset'} errorComponent={NotFoundComponent}>
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
      <CatchBoundary getResetKey={() => 'version_history_reset'} errorComponent={NotFoundComponent}>
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
      <CatchBoundary getResetKey={() => 'audit_log_reset'} errorComponent={NotFoundComponent}>
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
      <CatchBoundary getResetKey={() => 'permissions_reset'} errorComponent={NotFoundComponent}>
        <PermissionsPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const appLicenseInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/license',
  component: () => {
    const { appId } = appLicenseInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'license_reset'} errorComponent={NotFoundComponent}>
        <LicensePage appId={appId} />
      </CatchBoundary>
    );
  },
});

const supportInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/contact',
  component: () => {
    const { appId } = supportInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'contact_reset'} errorComponent={NotFoundComponent}>
        <ContactSupportPage appId={appId} />
      </CatchBoundary>
    );
  },
});

const appDescriptionRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/description',
  component: () => {
    const { appId } = infoRootRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'description_reset'} errorComponent={NotFoundComponent}>
        <AppDescriptionPage appId={appId} />
      </CatchBoundary>
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
        errorComponent={NotFoundComponent}
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
        errorComponent={NotFoundComponent}
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
        errorComponent={NotFoundComponent}
      >
        <ExtensionEditStep2Page extensionId={extensionId} />
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
        errorComponent={NotFoundComponent}
      >
        <ExtensionEditStep3Page extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionSubmitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/submit-extension/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionSubmitRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'submit_extension_reset'}
        errorComponent={NotFoundComponent}
      >
        <ExtensionSubmitPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

const extensionReleaseSubmitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/submit-release/$extensionId`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    const { extensionId } = extensionReleaseSubmitRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'submit_release_reset'} errorComponent={NotFoundComponent}>
        <ExtensionReleaseSubmitPage extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

type SubmitSearch = { type: SubmitType };

export enum SubmitType {
  EXTENSION = 'extension',
  RELEASE = 'release',
}

const postSubmitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/post-submit`,
  notFoundComponent: () => <NotFoundComponent />,
  validateSearch: (search: Record<string, unknown>): SubmitSearch => {
    return { type: search.type as SubmitType };
  },
  component: () => {
    const from = postSubmitRoute.useSearch();
    return (
      <CatchBoundary
        getResetKey={() => 'submit_extension_reset'}
        errorComponent={NotFoundComponent}
      >
        <PostSubmitPage type={from.type} />
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
    supportInfoRoute,
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
  ]),
  extensionSubmitRoute,
  extensionReleaseSubmitRoute,
  postSubmitRoute,
]);

export const router = ({ baseRouteName, apolloClient }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
    },
    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
