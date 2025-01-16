import type { SingleSpaCustomEventDetail } from 'single-spa';
import {
  AnalyticsEventData,
  AnalyticsEventTypes,
  IRootComponentProps,
} from '@akashaorg/typings/lib/ui';
import { filterEvents } from '@akashaorg/ui-core-hooks';

export interface CustomSingleSpaEvent extends Event {
  detail: SingleSpaCustomEventDetail;
  currentTarget: typeof window;
}

export const enableTracking = () => {
  if (window['_paq']) {
    window['_paq'].push(['setConsentGiven']);
    window['_paq'].push(['setCookieConsentGiven']);
    window['_paq'].push(['trackPageView']);
    window['_paq'].push(['enableLinkTracking']);
  }
};

export const trackEvent = (event: AnalyticsEventData) => {
  if (checkTrackingIsAllowed() && window['_paq']) {
    window['_paq'].push([
      'trackEvent',
      event.data.category,
      event.data.action,
      event.data.name,
      event.data.value,
    ]);
  }
};

export const registerEventBusSubscriber = (eventBus: IRootComponentProps['uiEvents']) => {
  return eventBus
    .pipe(filterEvents([AnalyticsEventTypes.TRACK_EVENT, AnalyticsEventTypes.ENABLE_TRACKING]))
    .subscribe(evData => {
      if (!evData.event) {
        return;
      }
      if (checkTrackingIsAllowed()) {
        switch (evData.event) {
          // enable tracking can be 'requested' from another integration. e.g. User Settings
          case AnalyticsEventTypes.ENABLE_TRACKING:
            enableTracking();
            break;
          case AnalyticsEventTypes.TRACK_EVENT:
            trackEvent(evData);
            break;
          default:
            break;
        }
      }
    });
};

export const installPageTacking = () => {
  window.addEventListener('single-spa:routing-event', trackRoutingEvent);
  // also track the current page
  if (window['_paq']) {
    window['_paq'].push(['trackPageView']);
  }
};

export const uninstallPageTacking = () => {
  window.removeEventListener('single-spa:routing-event', trackRoutingEvent);
};

export const trackRoutingEvent = (event: CustomSingleSpaEvent) => {
  if (checkTrackingIsAllowed() && window.hasOwnProperty('_paq')) {
    const { detail } = event;
    window['_paq'].push(['setCustomUrl', `${detail.newUrl}`]);
    window['_paq'].push(['setReferrerUrl', `${detail.oldUrl}`]);
    window['_paq'].push(['deleteCustomVariables', 'page']);
    window['_paq'].push(['trackPageView']);
  }
};

export const checkTrackingIsAllowed = () => {
  const matomo = window['Matomo'];
  // should we include browser DNT Feature? Deprecated in some browsers!
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack

  if (matomo && matomo.getTracker()?.hasConsent()) {
    return true;
  }
  return false;
};

export const installTrackingScript = ({ trackerUrl, siteId }) => {
  installMatomo({ trackerUrl, siteId });
};

export const installMatomo = ({ trackerUrl, siteId }) => {
  if (window.hasOwnProperty('Matomo') || !trackerUrl || !siteId) {
    return;
  }

  const url = new URL(trackerUrl);
  const _paq = (window['_paq'] = window['_paq'] || []);
  _paq.push(['setTrackerUrl', `${url.toString()}matomo.php`]);
  _paq.push(['setSiteId', siteId]);
  const script = document.createElement('script');
  const headScript = document.getElementsByTagName('script')[0];
  script.type = 'text/javascript';
  script.src = `//cdn.matomo.cloud/${url.hostname}/matomo.js`;
  script.async = true;
  headScript.parentNode.insertBefore(script, headScript);
};
