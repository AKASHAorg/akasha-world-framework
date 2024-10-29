import { NotFoundComponent } from '../../app-routes/not-found-component';
import { InfoPage } from './info-page';
import {
  AppDescriptionPage,
  CollaboratorsPage,
  DevInfoPage,
  LicensePage,
  PermissionsPage,
  ReleasesPage,
} from './sub-pages';
import { getExtensionById } from '../../app-routes/data-loaders';
import {
  selectAppId,
  selectExtensionCollaborators,
  selectExtensionDescription,
  selectExtensionDisplayName,
  selectExtensionLicense,
  selectExtensionLogo,
  selectExtensionName,
  selectExtensionType,
  selectReleasesCount,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-query';
import { Await, CatchBoundary, createRoute, defer, Outlet } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { RouteErrorComponent } from '../../app-routes/error-component';
import { rootRoute } from '../../root-route';

const infoRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/info/$appId',
  component: Outlet,
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

const releasesRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/releases',
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
    const { appId: appName } = infoRootRoute.useParams();
    const { extensionById } = releasesRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'app_info_root_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={extensionById}>
            {data => (
              <ReleasesPage
                appId={selectAppId(data)}
                extensionLogo={selectExtensionLogo(data)}
                extensionName={selectExtensionName(data)}
                extensionDisplayName={selectExtensionDisplayName(data)}
                extensionType={selectExtensionType(data)}
                releasesCount={selectReleasesCount(data)}
                appName={appName}
              />
            )}
          </Await>
        </Suspense>
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

export default infoRootRoute.addChildren([
  infoIndexRoute,
  devInfoRoute,
  collaboratorsInfoRoute,
  releasesRoute,
  permissionInfoRoute,
  appLicenseInfoRoute,
  appDescriptionRoute,
]);
