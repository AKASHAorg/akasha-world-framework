import 'systemjs-webpack-interop/auto-public-path';
import { IntegrationRegistrationOptions, WidgetInterface } from '@akashaorg/typings/lib/ui';
import { extensionSlots } from './extension-points';

export const register = (opts: IntegrationRegistrationOptions): WidgetInterface => {
  return {
    mountsIn: opts.layoutSlots?.topbarSlotId,
    rootComponent: () => import('./components'),
    extensionSlots,
  };
};
