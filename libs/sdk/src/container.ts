import { Container } from 'inversify';
import { TYPES } from '@akashaorg/typings/lib/sdk';
import Logging from './logging';
import Gql from './gql';
import Settings from './settings';
import Stash from './stash';
import DB from './db';
import Web3Connector from './common/web3.connector';
import EventBus from './common/event-bus';
import AWF_Auth from './auth';
import AWF_Profile from './profiles';
import AWF_IpfsConnector from './common/ipfs.connector';
import AppSettings from './settings/apps';
import AWF_Misc from './common/misc';
import AWF_Lit from './common/lit';
import AWF_Ceramic from './common/ceramic';
import AWF_Config from './common/config';
import Notification from './common/notification/notification';

const diContainer = new Container({
  defaultScope: 'Singleton',
});
diContainer.bind<AWF_Config>(TYPES.Config).to(AWF_Config);
diContainer.bind<AWF_Misc>(TYPES.Misc).to(AWF_Misc);
diContainer.bind<Logging>(TYPES.Log).to(Logging);
diContainer.bind<Gql>(TYPES.Gql).to(Gql);
diContainer.bind<Settings>(TYPES.Settings).to(Settings);
diContainer.bind<Stash>(TYPES.Stash).to(Stash);
diContainer.bind<DB>(TYPES.Db).to(DB);
diContainer.bind<EventBus>(TYPES.EventBus).toDynamicValue(() => new EventBus());
diContainer.bind<Web3Connector>(TYPES.Web3).to(Web3Connector);
diContainer.bind<AWF_Auth>(TYPES.Auth).to(AWF_Auth);
diContainer.bind<AWF_Profile>(TYPES.Profile).to(AWF_Profile);
diContainer.bind<AWF_IpfsConnector>(TYPES.IPFS).to(AWF_IpfsConnector);
diContainer.bind<AppSettings>(TYPES.AppSettings).to(AppSettings);
diContainer.bind<AWF_Lit>(TYPES.Lit).to(AWF_Lit);
diContainer.bind<AWF_Ceramic>(TYPES.Ceramic).to(AWF_Ceramic);
diContainer.bind<Notification>(TYPES.Notification).to(Notification);
//@Todo: implement init watcher to prevent ambiguous service
// export const importLazy = async () => {
//   const r = await import('./gql/index.new');
//   diContainer.bind<GqlNew>(TYPES.GqlNew).to(r.default);
// };

//diContainer.bind<GqlNew>(TYPES.GqlNew).to(GqlNew);
export default diContainer;
