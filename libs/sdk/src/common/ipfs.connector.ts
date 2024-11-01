import { inject, injectable } from 'inversify';
import { LEGAL_DOCS, LegalDocsSchema, TYPES } from '@akashaorg/typings/lib/sdk';
import Logging from '../logging';
import { CID } from 'multiformats/cid';
import { base16 } from 'multiformats/bases/base16';
import { multiaddrToUri } from '@multiformats/multiaddr-to-uri';
import { Client, create } from '@web3-storage/w3up-client';
import * as Signer from '@ucanto/principal/ed25519';
import pino from 'pino';
import { z } from 'zod';
import { validate } from './validator';
import CeramicService from './ceramic';
// import { fromString } from 'uint8arrays/from-string';
// import { toString } from 'uint8arrays/to-string';
import { extract } from '@ucanto/core/delegation';
import type { Cacao } from '@didtools/cacao';
import { StoreMemory } from '@web3-storage/access/stores/store-memory';
import AWF_Config from './config';

export type SessionObj = {
  sessionKeySeed: string;
  cacao: Cacao;
};

@injectable()
class AWF_IpfsConnector {
  private _log: pino.Logger;
  private _ceramic: CeramicService;
  private readonly LEGAL_DOCS_SOURCE = {
    [LEGAL_DOCS.TERMS_OF_USE]: 'bafkreie3pa22hfttuuier6rp6sm7nngfc5jgfjzre7wc5a2ww7z375fhwm',
    [LEGAL_DOCS.TERMS_OF_SERVICE]: 'bafkreib5jg73c6bmbzkrokpusraiwwycnkypol3xh3uadsu7hhzefp6g2e',
    [LEGAL_DOCS.PRIVACY_POLICY]: 'bafkreifjtbzuxwhhmmpq7c3xn74wbzog3robhsjyauvwtshh6zst2axlhm',
    [LEGAL_DOCS.CODE_OF_CONDUCT]: 'bafkreie6ygpcmpckoxnb6rip62nxztntwu5k2oqmwfvxyubfppwimhype4',
    [LEGAL_DOCS.APP_GUIDE]: 'bafkreidpkbwzpxupnnty4bua5w4n7ddiyugb2ermb2htkxczrw7okan3nu',
  };
  #w3upClient: Client | null;
  private _config: AWF_Config;

  constructor(
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Ceramic) ceramic: CeramicService,
    @inject(TYPES.Config) config: AWF_Config,
  ) {
    this._log = log.create('AWF_IpfsConnector');
    this._ceramic = ceramic;
    this._config = config;
    this.#w3upClient = null;
  }

  getSettings() {
    return {
      pathGateway: this._config.getOption('ipfs_path_gateway'),
      originGateway: this._config.getOption('ipfs_origin_gateway'),
      fallbackGateway: this._config.getOption('ipfs_fallback_gateway'),
    };
  }

  /*
   * _createClient is a private async method that creates a w3upClient instance.
   *
   * It first serializes the current Ceramic session. If no session exists, an error is thrown.
   *
   * The serialized session is parsed to extract the sessionKeySeed, which is converted from base64url to base64pad encoding.
   *
   * The sessionKeySeed is passed to the Signer.derive method to derive a principal.
   *
   * The principal is then passed to the create method from @web3-storage/w3up-client to instantiate the client.
   *
   * The new client instance is assigned to the #w3upClient property.
   *
   * @returns {Promise<void>}
   */
  private async _createClient() {
    // const serialisedSession = await this._ceramic.serialize();
    // if (!serialisedSession) {
    //   throw new Error('Must start a did-session first!');
    // }
    // const { sessionKeySeed } = JSON.parse(
    //   toString(fromString(serialisedSession, 'base64url')),
    // ) as SessionObj;
    // const keySeed = fromString(sessionKeySeed, 'base64pad');
    const principal = await Signer.generate();
    this.#w3upClient = await create({ principal, store: new StoreMemory() });
  }

  /*
   * _getStorageProof is a private async method that retrieves a storage delegation proof from the delegateBaseUrl.
   *
   * It first checks if the delegateBaseUrl is set, and throws an error if not.
   *
   * It then constructs a URL to request a create-proof endpoint, passing the current client's DID.
   *
   * The proof is fetched and the response ArrayBuffer is extracted.
   *
   * The proof is deserialized using the extract method from @ucanto/core/delegation.
   *
   * If delegation extraction fails, an error is thrown.
   *
   * Otherwise the extracted delegation is returned.
   *
   * @returns {Promise<Delegation>} The deserialized storage delegation proof.
   */
  private async _getStorageProof() {
    const delegateBaseUrl = this._config.getOption('w3_storage_delegate_base_url');
    if (!delegateBaseUrl) {
      throw new Error('Must set env.W3_STORAGE_DELEGATE_BASE_URL');
    }
    const url = new URL(`create-proof/${this.#w3upClient!.did()}`, delegateBaseUrl);
    const response = await fetch(url, { method: 'POST' });
    const data = await response.arrayBuffer();

    // Deserialize the delegation
    const delegation = await extract(new Uint8Array(data));
    if (!delegation.ok) {
      this._log.error(delegation.error);
      throw new Error('Failed to extract delegation');
    }
    return delegation.ok;
  }

  /*
   * uploadFile is an async method that uploads a file to IPFS via w3upClient.
   *
   * It first checks if the w3upClient exists, and creates it if not by calling _createClient.
   *
   * It then checks that the client was created successfully.
   *
   * It gets the current spaces for the client - if there are none, it:
   *   - Retrieves a storage delegation proof by calling _getStorageProof
   *   - Uses the proof to add a space to the client
   *   - Sets the new space as the current space
   *
   * Finally, it calls uploadFile on the client instance to upload the file.
   *
   * @param file - The Blob file to upload
   * @returns {Promise<string>} - The IPFS CID of the uploaded file
   */
  @validate(z.instanceof(Blob))
  async uploadFile(file: Blob) {
    if (!this.#w3upClient) {
      await this._createClient();
    }

    if (!this.#w3upClient) {
      this._log.warn('Something went wrong with setting w3upClient.');
      return;
    }
    const spaces = this.#w3upClient.spaces();
    if (!spaces.length) {
      const delegation = await this._getStorageProof();
      const space = await this.#w3upClient.addSpace(delegation);
      await this.#w3upClient.setCurrentSpace(space.did());
    }
    this._log.info('uploading file');
    return this.#w3upClient!.uploadFile(file);
  }

  @validate(z.union([z.string(), z.instanceof(CID)]), z.boolean().optional())
  async catDocument<T>(docHash: string | CID, jsonResponse = false): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    return fetch(this.buildFallBackLink(docHash), { signal: controller.signal }).then(res => {
      clearTimeout(timeout);
      if (res.ok) {
        if (!jsonResponse) {
          return res.text();
        }
        return res.json();
      }
      this._log.warn(res.statusText);
      throw Error('An error occurred!');
    });
  }

  /**
   *
   * @param doc - legal docs
   */
  @validate(LegalDocsSchema)
  async getLegalDoc(doc: LEGAL_DOCS) {
    const selectedDoc = this.LEGAL_DOCS_SOURCE[doc];
    return this.catDocument<never>(selectedDoc);
  }

  @validate(z.union([z.string(), z.instanceof(CID)]))
  validateCid(hash: string | CID) {
    if (typeof hash === 'string' && hash.startsWith('https://')) {
      return { link: hash };
    }
    const cid = typeof hash === 'string' ? CID.parse(hash) : CID.asCID(hash);
    if (!cid) {
      throw new Error(`Hash ${hash.toString()} is not a valid CID`);
    }
    return { cid };
  }

  @validate(z.union([z.string(), z.instanceof(CID)]))
  buildOriginLink(hash: string | CID) {
    const { link, cid } = this.validateCid(hash);
    if (link) {
      return link;
    }
    return `https://${cid?.toV1().toString()}.${this.getSettings().originGateway}`;
  }

  @validate(z.union([z.string(), z.instanceof(CID)]))
  buildFallBackLink(hash: string | CID) {
    const { link, cid } = this.validateCid(hash);
    if (link) {
      return link;
    }
    return `https://${cid?.toV1().toString()}.${this.getSettings().fallbackGateway}`;
  }

  @validate(z.union([z.string(), z.instanceof(CID)]))
  buildPathLink(hash: string | CID) {
    const { link, cid } = this.validateCid(hash);
    if (link) {
      return link;
    }
    return `${this.getSettings().pathGateway}${cid?.toV1().toString()}`;
  }

  @validate(z.union([z.string(), z.instanceof(CID)]))
  buildIpfsLinks(hash: string | CID) {
    const originLink = this.buildOriginLink(hash);
    const fallbackLink = this.buildFallBackLink(hash);
    const pathLink = this.buildPathLink(hash);

    return {
      originLink,
      fallbackLink,
      pathLink,
    };
  }

  @validate(z.string())
  transformBase16HashToV1(hash: string) {
    const cid = CID.parse(hash, base16.decoder);
    return cid.toV1();
  }

  @validate(z.string())
  addrToUri(addr: string) {
    if (addr.substring(0, 6) === '/ipfs/') {
      return this.buildOriginLink(addr.substring(6));
    } else if (addr.substring(0, 7) === 'ipfs://') {
      return this.buildOriginLink(addr.substring(7));
    } else if (addr.substring(0, 1) === '/') {
      return multiaddrToUri(addr);
    } else if (addr.startsWith('https://')) {
      return addr;
    }
  }

  @validate(z.array(z.string()).or(z.string()))
  multiAddrToUri(addrList: string | string[]) {
    if (Array.isArray(addrList)) {
      const results: string[] = [];
      for (const addr of addrList) {
        const result = this.addrToUri(addr);
        if (result) {
          results.push(result);
        }
      }
      return results;
    }
    return this.addrToUri(addrList);
  }
}

export default AWF_IpfsConnector;
