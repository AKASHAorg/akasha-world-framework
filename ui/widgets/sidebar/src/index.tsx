import 'systemjs-webpack-interop/auto-public-path';
import { IntegrationRegistrationOptions, WidgetInterface } from '@akashaorg/typings/lib/ui';

/**
 * All widgets must export an object like this:
 */
export const register: (opts: IntegrationRegistrationOptions) => WidgetInterface = opts => ({
  mountsIn: opts.layoutConfig?.sidebarSlotId,
  loadingFn: () => import('./sidebar'),
  activeWhen: () => true,
});
