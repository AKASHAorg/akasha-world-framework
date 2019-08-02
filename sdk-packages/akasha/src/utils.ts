import { AkashaServicePath, IAkashaModule } from '@akashaproject/sdk-core/lib/IAkashaModule';
import DIContainer from '@akashaproject/sdk-runtime/lib/DIContainer';
import { CallableService } from '@akashaproject/sdk-runtime/lib/IDIContainer';
import { Observable } from 'rxjs';

export type SendChannel = (servicePath: AkashaServicePath, payload: object) => Observable<any>;
export interface IProxyCallableService {
  [x: string]: CallableService;
}
export interface IModuleCallableService {
  [y: string]: IProxyCallableService;
}
/**
 *
 * @param servicePath
 */
const channelCaller = (servicePath: AkashaServicePath) => {
  return {
    // tslint:disable:only-arrow-functions
    // tslint:disable: object-literal-shorthand
    apply: function(target, thisArg, argumentsList: [object]) {
      return target(servicePath, argumentsList[0]);
    }
  };
};

// tslint:enable:only-arrow-functions
// tslint:enable: object-literal-shorthand

// ex createCallableService(["module", "SERVICE"], {send: (path, payload)=>true})
// returns callable = { service: ProxyService }
// can be used like: callable.service(payload)
export function createCallableService(servicePath: AkashaServicePath, channelSend: SendChannel) {
  const handler = channelCaller(servicePath);
  return new Proxy(channelSend, handler);
}

/**
 *
 * @param currentModule
 * @param channelSend
 */
export function extractCallableServices(
  currentModule: IAkashaModule,
  channelSend: SendChannel
): IModuleCallableService {
  const exportedCommonServices: IProxyCallableService = {};
  const services = currentModule.availableServices();
  for (const serviceName of Object.keys(services)) {
    const servicePath: AkashaServicePath = services[serviceName];
    exportedCommonServices[serviceName.toLowerCase()] = createCallableService(
      servicePath,
      channelSend
    );
  }
  return { [currentModule.name]: exportedCommonServices };
}

/**
 *
 * @param modules
 * @param channelSend
 */
export function buildModuleServiceChannels(
  modules: IAkashaModule[],
  channelSend: SendChannel
): IModuleCallableService {
  const channels: IModuleCallableService = {};
  for (const currentModule of modules) {
    const extractedServices = extractCallableServices(currentModule, channelSend);
    Object.assign(channels, extractedServices);
  }
  return channels;
}

export async function startServices(modules: IAkashaModule[], di: DIContainer): Promise<void> {
  for (const moduleInstance of modules) {
    await moduleInstance.startServices(di);
  }
}
