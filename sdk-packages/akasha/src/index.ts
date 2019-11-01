import registerCommonModule from '@akashaproject/sdk-common';
import initDI from '@akashaproject/sdk-core';
import { IAkashaModule } from '@akashaproject/sdk-core/lib/IAkashaModule';
import registerDBModule from '@akashaproject/sdk-db';
import DIContainer from '@akashaproject/sdk-runtime/lib/DIContainer';
import initChannel from './channel';
import {
  buildModuleServiceChannels,
  IModuleCallableService,
  SendChannel,
  startServices,
} from './utils';

const initDiChannel = (di: DIContainer, sendChannel: SendChannel) => {
  return (mList: IAkashaModule[]): IModuleCallableService => {
    startServices(mList, di);
    // build the module services for the sdk consumer
    return buildModuleServiceChannels(mList, sendChannel);
  };
};

module.exports = function init(options = { start: true }) {
  const di: DIContainer = initDI();
  const commonModule = registerCommonModule();
  const dbModule = registerDBModule();
  let modules: IModuleCallableService = {};
  // list of all the registered modules for the sdk
  const modulesList = [commonModule, dbModule];
  // general channel to send service calls
  const channel = initChannel(di);
  // prepare the start function for integrations
  const start = initDiChannel(di, channel.send);
  if (options.start) {
    modules = start(modulesList);
  }
  return Object.assign({}, modules, { start });
};
