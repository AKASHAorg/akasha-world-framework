import 'systemjs-webpack-interop/auto-public-path';
import { IntegrationRegistrationOptions, WidgetInterface } from '@akashaorg/typings/lib/ui';

export const register = (opts: IntegrationRegistrationOptions): WidgetInterface => ({
  rootComponent: () => import('./components'),
  mountsIn: opts.layoutSlots?.widgetSlotId,
});
