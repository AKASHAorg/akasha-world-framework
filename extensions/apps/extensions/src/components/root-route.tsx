import { IRootComponentProps, IRouterContext } from '@akashaorg/typings/lib/ui';
import { NotFoundComponent } from './app-routes/not-found-component';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';

export const rootRoute = createRootRouteWithContext<
  IRouterContext & {
    decodeAppName: IRootComponentProps['decodeAppName'];
    plugins: IRootComponentProps['plugins'];
  }
>()({
  component: Outlet,
  notFoundComponent: () => <NotFoundComponent />,
});
