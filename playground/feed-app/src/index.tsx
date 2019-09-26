import { Avatar } from '@akashaproject/design-system';
import EventsPlugin from '@akashaproject/ui-plugin-events';
import FeedPlugin from '@akashaproject/ui-plugin-feed';
import AppLoader from '@akashaproject/ui-plugin-loader';
import initSdk from './sdk-init';

const sdk: any = initSdk();
const app = new AppLoader({
  rootNodeId: 'root',
});
// tslint:disable-next-line:no-console
console.log(Avatar); // just to showcase the usage @TODO: remove this

// here you can rename different modules before passing them to the plugins
// it also enables dynamic build of dependencies
// ex: [['commons', obj1],['entries', obj2]] becomes at plugin level {commons: obj1, entries: obj2}
const commonModule = ['commons', sdk.modules.commons];
const promises = [
  app.registerPlugin(FeedPlugin, null, [commonModule]),
  app.registerPlugin(EventsPlugin, { activeWhen: { path: '/events' } }, [commonModule]),
];
Promise.all(promises).then(() => app.start());
