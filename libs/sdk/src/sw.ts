import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import {
  //pageCache,
  imageCache,
  staticResourceCache,
  offlineFallback,
} from 'workbox-recipes';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

precacheAndRoute(self.__WB_MANIFEST);

// pageCache({ networkTimeoutSeconds: 6 });
staticResourceCache({ cacheName: 'static-v1.0' });
imageCache({ maxEntries: 300 });
offlineFallback({ pageFallback: '/img/offline-page.png', imageFallback: '/img/offline-img.png' });
setCacheNameDetails({
  prefix: 'akasha',
  suffix: 'v0.1.0',
  // precache: 'install-time',
  // runtime: 'run-time',
  googleAnalytics: 'ga',
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.skipWaiting();
clientsClaim();
