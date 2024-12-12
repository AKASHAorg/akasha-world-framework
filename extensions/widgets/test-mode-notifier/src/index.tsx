import 'systemjs-webpack-interop/auto-public-path';
import { IntegrationRegistrationOptions, WidgetInterface } from '@akashaorg/typings/lib/ui';

export const register = (opts: IntegrationRegistrationOptions): WidgetInterface => {
  return {
    mountsIn: opts.layoutSlots?.cookieWidgetSlotId,
    loadingFn: () => import('./components'),
  };
};
