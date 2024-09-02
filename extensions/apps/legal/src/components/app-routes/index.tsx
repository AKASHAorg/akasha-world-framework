import React from 'react';
import { Outlet } from '@tanstack/react-router';
import MainPage from '../pages/main-page';
import TermsOfService from '../pages/terms-of-service';
import TermsOfUse from '../pages/terms-of-use';
import CodeOfConduct from '../pages/code-of-conduct';
import PrivacyPolicy from '../pages/privacy-policy';
import DeveloperGuidelines from '../pages/developer-guidelines';
import routes, { HOME, TOS, TOU, PP, COC, DG } from '../../routes';
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';

import { ICreateRouter } from '@akashaorg/typings/lib/ui';
import { NotFoundComponent } from './not-found-component';

const rootRoute = createRootRoute({
  component: Outlet,
});

const defaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: routes[HOME], replace: true });
  },
});

const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[HOME]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: MainPage,
});

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[TOS]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return <TermsOfService />;
  },
});

const termsOfUseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[TOU]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return <TermsOfUse />;
  },
});

const codeOfConductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[COC]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return <CodeOfConduct />;
  },
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[PP]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return <PrivacyPolicy />;
  },
});

const developerGuidelinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[DG]}`,
  notFoundComponent: () => <NotFoundComponent />,
  component: () => {
    return <DeveloperGuidelines />;
  },
});

const routeTree = rootRoute.addChildren([
  defaultRoute,
  mainRoute,
  termsOfServiceRoute,
  termsOfUseRoute,
  codeOfConductRoute,
  privacyPolicyRoute,
  developerGuidelinesRoute,
]);

export const router = ({ baseRouteName }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,

    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
