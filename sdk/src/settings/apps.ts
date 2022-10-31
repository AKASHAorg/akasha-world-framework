import { inject, injectable } from 'inversify';
import { APP_EVENTS, TYPES } from '@akashaorg/typings/sdk';
import DB, { availableCollections } from '../db';
import { createFormattedValue } from '../helpers/observable';
import { lastValueFrom } from 'rxjs';
import { AppsSchema } from '../db/app.schema';
import Logging from '../logging/index';
import IcRegistry from '../registry/icRegistry';
import { ethers } from 'ethers';
import EventBus from '../common/event-bus';
import pino from 'pino';

declare const __DEV__: boolean;

export interface VersionInfo {
  name: string;
  version: string;
}
export interface ConfigInfo {
  name: string;
  config: string[][];
}
@injectable()
class AppSettings {
  private _db: DB;
  private _log: pino.Logger;
  private _icRegistry: IcRegistry;
  private _globalChannel: EventBus;

  constructor(
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Db) db: DB,
    @inject(TYPES.ICRegistry) icRegistry: IcRegistry,
    @inject(TYPES.EventBus) globalChannel: EventBus,
  ) {
    this._log = log.create('AWF_Settings_Apps');
    this._db = db;
    this._icRegistry = icRegistry;
    this._globalChannel = globalChannel;
  }

  /**
   * Returns an app configuration object
   * @param appName - Name of the app
   */
  async get(appName: string) {
    const collection = await lastValueFrom(
      this._db.getCollection<AppsSchema>(availableCollections.Apps),
    );
    const doc = await collection.data.findOne({ name: { $eq: appName } });
    return createFormattedValue(doc);
  }

  /**
   * Returns all installed apps
   */
  async getAll() {
    const collection = await lastValueFrom(
      this._db.getCollection<AppsSchema>(availableCollections.Apps),
    );
    const doc = await collection.data.find().toArray();
    return createFormattedValue(doc);
  }

  /**
   * Persist installed app configuration for the current user
   * @param app - Object
   */
  async install(app: { name?: string; id?: string }, isLocal = false) {
    if (isLocal && __DEV__) {
      const collection = await lastValueFrom(
        this._db.getCollection<any>(availableCollections.Apps),
      );
      this._globalChannel.next({
        data: { name: app.name, id: app.id },
        event: APP_EVENTS.INFO_READY,
      });

      return collection.data.save({ name: app.name, id: app.id });
    }
    const release = await this._icRegistry.getLatestVersionInfo(app);
    const currentInfo = await this.get(release.name);
    if (currentInfo?.data?._id) {
      this._log.warn(`${app.name} already installed.`);
      return false;
    }
    if (!release?.enabled) {
      this._log.warn(`${app.name} cannot be installed.`);
      return false;
    }
    const collection = await lastValueFrom(
      this._db.getCollection<AppsSchema>(availableCollections.Apps),
    );
    const integrationInfo = {
      id: release.integrationID,
      name: release.name,
      integrationType: release.integrationType,
      version: release.version,
      sources: release.sources,
      status: true,
    };
    this._globalChannel.next({
      data: integrationInfo,
      event: APP_EVENTS.INFO_READY,
    });
    return collection.data.save(integrationInfo);
  }

  /**
   * Uninstall app by name
   * @param appName - Name of the app
   */
  async uninstall(appName: string): Promise<void> {
    const currentInfo = await this.get(appName);
    if (currentInfo?.data?._id) {
      const collection = await lastValueFrom(
        this._db.getCollection<AppsSchema>(availableCollections.Apps),
      );
      await collection.data.delete(currentInfo.data._id);
      this._globalChannel.next({
        data: { name: appName },
        event: APP_EVENTS.REMOVED,
      });
    }
  }

  async toggleAppStatus(appName: string): Promise<boolean> {
    const collection = await lastValueFrom(
      this._db.getCollection<AppsSchema>(availableCollections.Settings),
    );
    const query: unknown = { name: { $eq: appName } };
    const doc = await collection.data.findOne(query);
    if (doc._id) {
      doc.status = !doc.status;
      await doc.save();
      this._globalChannel.next({
        data: { status: doc.status, name: appName },
        event: APP_EVENTS.TOGGLE_STATUS,
      });
      return doc.status;
    }
  }

  async updateVersion(app: VersionInfo) {
    const release = await this._icRegistry.getIntegrationReleaseInfo(
      ethers.utils.id(`${app.name}${app.version}`),
    );
    const currentInfo = await this.get(release.name);
    if (!currentInfo?.data?._id) {
      this._log.warn(`${app.name} is not installed`);
      return false;
    }
    currentInfo.data.version = release.version;
    currentInfo.data.sources = release.sources;
    this._globalChannel.next({
      data: {
        status: currentInfo.data.status,
        name: app.name,
        version: currentInfo.data.version,
        sources: currentInfo.data.sources,
        integrationType: currentInfo.data.integrationType,
      },
      event: APP_EVENTS.UPDATE_VERSION,
    });
    return currentInfo.data.save();
  }

  async updateConfig(app: ConfigInfo) {
    const currentInfo = await this.get(app.name);
    if (!currentInfo?.data?._id) {
      this._log.warn(`${app.name} is not installed`);
      return false;
    }
    currentInfo.data.config = app.config;
    this._globalChannel.next({
      data: {
        name: app.name,
        config: app.config,
      },
      event: APP_EVENTS.UPDATE_CONFIG,
    });
    return currentInfo.data.save();
  }
}

export default AppSettings;
