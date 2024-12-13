import { NotFoundComponent } from '../../app-routes/not-found-component';
import { InfoPage } from './info-page';
import {
  AppDescriptionPage,
  ContributorsPage,
  DevInfoPage,
  LicensePage,
  ReleasesPage,
} from './sub-pages';
import { getExtensionByName } from '../../app-routes/data-loaders';
import {
  selectAppId,
  selectExtensionContributors,
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
import { IProfilePlugin } from '@akashaorg/typings/lib/ui';
import { AkashaProfile } from '@akashaorg/typings/lib/sdk/graphql-types-new';

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
  loader: ({ context, params }) => {
    const { devDid } = params;

    if (!devDid) {
      throw new Error('devDid is required');
    }

    const profilePlugin = context.plugins['@akashaorg/app-profile'] as {
      profile: IProfilePlugin<AkashaProfile>;
    };

    if (!profilePlugin) {
      throw new Error('@akashaorg/app-profile is required to display this page');
    }

    return {
      devProfileReq: defer(profilePlugin.profile?.getProfileInfo({ profileDID: devDid })),
    };
  },
  component: () => {
    const { devDid } = devInfoRoute.useParams();
    const { devProfileReq } = devInfoRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'dev_info_root_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={devProfileReq}>
            {resp => (
              <DevInfoPage
                name={resp.data.name}
                avatar={resp.data.avatar}
                devDid={devDid}
                error={resp.error}
              />
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const contributorsInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/contributors',
  loader: ({ context, params }) => {
    const { appId } = params;
    if (!appId) {
      throw new Error('appId is required');
    }
    return {
      extensionById: defer(getExtensionByName(context.decodeAppName(appId))),
    };
  },
  component: () => {
    const { appId } = infoRootRoute.useParams();
    const { extensionById } = contributorsInfoRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'collaborators_reset'} errorComponent={RouteErrorComponent}>
        <Suspense>
          <Await promise={extensionById}>
            {data => (
              <ContributorsPage
                extensionLogo={selectExtensionLogo(data)}
                extensionName={selectExtensionName(data)}
                extensionDisplayName={selectExtensionDisplayName(data)}
                contributors={selectExtensionContributors(data)}
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
      extensionById: defer(getExtensionByName(context.decodeAppName(appId))),
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

const appLicenseInfoRoute = createRoute({
  getParentRoute: () => infoRootRoute,
  path: '/license',
  loader: ({ context, params }) => {
    const { appId } = params;
    if (!appId) {
      throw new Error('appId is required');
    }
    return {
      extensionById: defer(getExtensionByName(context.decodeAppName(appId))),
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
      extensionById: defer(getExtensionByName(context.decodeAppName(appId))),
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
  contributorsInfoRoute,
  releasesRoute,
  appLicenseInfoRoute,
  appDescriptionRoute,
]);
