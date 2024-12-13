import React from 'react';
import { createRoute, CatchBoundary } from '@tanstack/react-router';
import {
  ExtensionEditMainPage,
  ExtensionEditStep1Page,
  ExtensionEditStep2Page,
  ExtensionEditStep3Page,
  ExtensionEditContributorsPage,
  ExtensionGalleryManagerPage,
} from './index';

import { rootRoute } from '../../root-route';
import { RouteErrorComponent } from '../../app-routes/error-component';
import { ExtSearch, ExtType } from '../../../constants';
import { NotFoundComponent } from '../../app-routes/not-found-component';

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

const galleryManagerRoute = createRoute({
  getParentRoute: () => extensionEditMainRoute,
  path: '/gallery-manager',
  validateSearch: (search: Record<string, unknown>): ExtSearch => {
    return { type: search.type as ExtType };
  },
  component: () => {
    const from = galleryManagerRoute.useSearch();
    const { extensionId } = extensionEditMainRoute.useParams();
    return (
      <CatchBoundary
        getResetKey={() => 'edit_extension_gallery_manager_reset'}
        errorComponent={RouteErrorComponent}
      >
        <ExtensionGalleryManagerPage type={from.type} extensionId={extensionId} />
      </CatchBoundary>
    );
  },
});

export default extensionEditMainRoute.addChildren([
  extensionEditStep1Route,
  extensionEditStep2Route,
  extensionEditStep3Route,
  extensionEditContributorsRoute,
  galleryManagerRoute,
]);
