import React from 'react';
import {
  CatchBoundary,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { ICreateRouter, IRouterContext } from '@akashaorg/typings/lib/ui';
import { MainPage } from '../../pages/index';
import routes, { HOME } from '../../routes';
import { NotFoundComponent } from './not-found-component';

const rootRoute = createRootRouteWithContext<IRouterContext>()({
  component: Outlet,
  notFoundComponent: () => <NotFoundComponent />,
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
  path: routes[HOME],
  component: () => {
    return (
      <CatchBoundary getResetKey={() => 'main_page_reset'} errorComponent={NotFoundComponent}>
        <MainPage />
      </CatchBoundary>
    );
  },
});

const routeTree = rootRoute.addChildren([defaultRoute, mainRoute]);

export const router = ({ baseRouteName, apolloClient }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
    },
    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
