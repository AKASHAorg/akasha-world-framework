import React, { createRef, Suspense } from 'react';
import GlobalAntennaPage from '../pages/global-antenna-page';
import MyAntennaPage from '../pages/my-antenna-page';
import BeamPage from '../pages/entry-page/beam-page';
import ReflectionPage from '../pages/entry-page/reflection-page';
import TagFeedPage from '../pages/tag-feed-page/tag-feed-page';
import EditorPage from '../pages/editor-page/editor-page';
import ReflectEditor from '../reflect-editor';
import EntrySectionLoading from '../pages/entry-page/entry-section-loading';
import routes, {
  GLOBAL_ANTENNA,
  MY_ANTENNA,
  BEAM,
  REFLECT,
  TAGS,
  EDITOR,
  REFLECTION,
} from '../../routes';
import {
  redirect,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  defer,
  Await,
  CatchBoundary,
} from '@tanstack/react-router';
import { ICreateRouter, IRouterContext } from '@akashaorg/typings/lib/ui';
import {
  getBeamById,
  getBeamStreamById,
  getReflectionById,
  getReflectionStreamById,
  selectBeamActiveField,
  selectBeamStatusField,
  selectReflectionActiveField,
  selectReflectionNode,
} from './data-loaders';
import { mapReflectEntryData } from '@akashaorg/ui-core-hooks';
import { NotFoundComponent } from './not-found-component';
import { EditorActions } from '@akashaorg/design-system-components/lib/components/Editor';

const editorActionsRef = createRef<EditorActions>();

const rootRoute = createRootRouteWithContext<IRouterContext>()({
  component: Outlet,
  notFoundComponent: () => <NotFoundComponent />,
});

const defaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: routes[GLOBAL_ANTENNA], replace: true });
  },
});

const antennaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[GLOBAL_ANTENNA],
  component: () => {
    return (
      <CatchBoundary getResetKey={() => 'antenna_reset'} errorComponent={NotFoundComponent}>
        <GlobalAntennaPage />
      </CatchBoundary>
    );
  },
});

const myAntennaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[MY_ANTENNA],
  component: () => {
    return (
      <CatchBoundary getResetKey={() => 'myAntenna_reset'} errorComponent={NotFoundComponent}>
        <MyAntennaPage />
      </CatchBoundary>
    );
  },
});

const beamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[BEAM]}/$beamId`,
  notFoundComponent: () => <NotFoundComponent />,
  loader: ({ context, params }) => ({
    beam: defer(getBeamById({ apolloClient: context.apolloClient, beamId: params.beamId })),
    beamStream: defer(
      getBeamStreamById({
        apolloClient: context.apolloClient,
        beamId: params.beamId,
      }),
    ),
  }),
  component: () => {
    const { beamId } = beamRoute.useParams();
    const { beam, beamStream } = beamRoute.useLoaderData();
    return (
      <CatchBoundary getResetKey={() => 'beamRoute_reset'} errorComponent={NotFoundComponent}>
        <Suspense fallback={<EntrySectionLoading />}>
          <Await promise={beamStream}>
            {({ data: beamStreamData }) => (
              <Await promise={beam}>
                {({ data: beamById }) => {
                  return (
                    <BeamPage
                      beamId={beamId}
                      isActive={selectBeamActiveField(beamStreamData)}
                      beamData={beamById}
                      beamStatus={selectBeamStatusField(beamStreamData)}
                      renderEditor={({ beamId, reflectToId, showEditor, setShowEditor }) => (
                        <ReflectEditor
                          beamId={beamId}
                          reflectToId={reflectToId}
                          showEditor={showEditor}
                          setShowEditor={setShowEditor}
                          editorActionsRef={editorActionsRef}
                        />
                      )}
                    />
                  );
                }}
              </Await>
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const beamReflectRoute = createRoute({
  getParentRoute: () => beamRoute,
  path: routes[REFLECT],
  component: () => {
    const { beamId } = beamReflectRoute.useParams();
    const { beam, beamStream } = beamRoute.useLoaderData();
    return (
      <CatchBoundary
        getResetKey={() => 'beamReflectRoute_reset'}
        errorComponent={NotFoundComponent}
      >
        <Suspense fallback={<EntrySectionLoading />}>
          <Await promise={beamStream}>
            {({ data: beamStreamData }) => (
              <Await promise={beam}>
                {({ data: beamById }) => {
                  return (
                    <BeamPage
                      beamId={beamId}
                      isActive={selectBeamActiveField(beamStreamData)}
                      beamData={beamById}
                      beamStatus={selectBeamStatusField(beamStreamData)}
                      renderEditor={({ beamId, reflectToId, showEditor, setShowEditor }) => (
                        <ReflectEditor
                          beamId={beamId}
                          reflectToId={reflectToId}
                          showEditor={showEditor}
                          setShowEditor={setShowEditor}
                          editorActionsRef={editorActionsRef}
                        />
                      )}
                    />
                  );
                }}
              </Await>
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const reflectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[REFLECTION]}/$reflectionId`,
  notFoundComponent: () => <NotFoundComponent />,
  loader: ({ context, params }) => ({
    reflection: defer(
      getReflectionById({
        apolloClient: context.apolloClient,
        reflectionId: params.reflectionId,
      }),
    ),
    reflectionStream: defer(
      getReflectionStreamById({
        apolloClient: context.apolloClient,
        reflectionId: params.reflectionId,
      }),
    ),
  }),
  component: () => {
    const { reflection, reflectionStream } = reflectionsRoute.useLoaderData();
    return (
      <CatchBoundary
        getResetKey={() => 'reflectionsRoute_reset'}
        errorComponent={NotFoundComponent}
      >
        <Suspense fallback={<EntrySectionLoading />}>
          <Await promise={reflectionStream}>
            {({ data: reflectionStreamData }) => (
              <Await promise={reflection}>
                {({ data: reflectionById }) => (
                  <ReflectionPage
                    isActive={selectReflectionActiveField(reflectionStreamData)}
                    reflectionData={mapReflectEntryData(selectReflectionNode(reflectionById))}
                    renderEditor={({ beamId, reflectToId, showEditor, setShowEditor }) => (
                      <ReflectEditor
                        beamId={beamId}
                        reflectToId={reflectToId}
                        showEditor={showEditor}
                        setShowEditor={setShowEditor}
                        editorActionsRef={editorActionsRef}
                      />
                    )}
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const reflectionsReflectRoute = createRoute({
  getParentRoute: () => reflectionsRoute,
  path: routes[REFLECT],
  component: () => {
    const { reflection, reflectionStream } = reflectionsRoute.useLoaderData();
    return (
      <CatchBoundary
        getResetKey={() => 'reflectionsReflect_reset'}
        errorComponent={NotFoundComponent}
      >
        <Suspense fallback={<EntrySectionLoading />}>
          <Await promise={reflectionStream}>
            {({ data: reflectionStreamData }) => (
              <Await promise={reflection}>
                {({ data: reflectionById }) => (
                  <ReflectionPage
                    isActive={selectReflectionActiveField(reflectionStreamData)}
                    reflectionData={mapReflectEntryData(selectReflectionNode(reflectionById))}
                    renderEditor={({ beamId, reflectToId, showEditor, setShowEditor }) => (
                      <ReflectEditor
                        beamId={beamId}
                        reflectToId={reflectToId}
                        showEditor={showEditor}
                        setShowEditor={setShowEditor}
                        editorActionsRef={editorActionsRef}
                      />
                    )}
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const tagFeedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes[TAGS]}/$tagName`,
  component: () => {
    const { tagName } = tagFeedRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'tagFeed_reset'} errorComponent={NotFoundComponent}>
        <TagFeedPage tagName={tagName} />
      </CatchBoundary>
    );
  },
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes[EDITOR],
  component: () => {
    return (
      <CatchBoundary getResetKey={() => 'editor_reset'} errorComponent={NotFoundComponent}>
        <EditorPage />
      </CatchBoundary>
    );
  },
});

const routeTree = rootRoute.addChildren([
  defaultRoute,
  antennaRoute,
  myAntennaRoute,
  beamRoute.addChildren([beamReflectRoute]),
  reflectionsRoute.addChildren([reflectionsReflectRoute]),
  tagFeedRoute,
  editorRoute,
]);

export const router = ({ baseRouteName, apolloClient }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
    },
    // errors thrown in the route loaders are caught here.
    // for a more granular errors, every loader should have an error handler
    // by default we'll treat loader errors as resource/page not found
    defaultErrorComponent: ({ error }) => {
      return <NotFoundComponent error={error} />;
    },
  });
