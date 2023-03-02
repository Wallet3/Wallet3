import Validator, { SyncCheckFunction } from 'fastest-validator';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import { ClientInfo } from '../../common/p2p/Constants';
import { DEFAULT_DERIVATION_PATH } from '../../common/Constants';
import EventEmitter from 'eventemitter3';
import MultiSigKey from '../../models/entities/MultiSigKey';
import secretjs from 'secrets.js-grempe';
import { sha256Sync } from '../../utils/cipher';
import { utils } from 'ethers';
import { xpubkeyFromHDNode } from '../../utils/bip32';

const QRSecretItemSchema = {
  root: 'string',
  bip32: 'string',
  secretsInfo: { $$type: 'object', threshold: 'number', version: 'string' },
  $$strict: false,
};

export type PlainSecretItem = {
  root: string;
  bip32: string;
  device: ClientInfo;
  secretsInfo: {
    threshold: number;
    bip32Path: string;
    bip32PathIndex: number;
    bip32Xpubkey: string;
    version: string;
    verifyPubkey: string;
    mainAddress: string;
  };
};

type Events = {
  combined: (mnemonic: string) => void;
  combineError: (error: Error) => void;
};

export class KeyRecovery extends EventEmitter<Events> {
  private readonly validator = new Validator().compile(QRSecretItemSchema) as SyncCheckFunction;
  shards: PlainSecretItem[] = [];

  get count() {
    return this.shards.length;
  }

  get threshold() {
    return this.shards[0]?.secretsInfo?.threshold ?? 0;
  }

  get info() {
    return this.shards[0]?.secretsInfo;
  }

  constructor() {
    super();
    makeObservable(this, { shards: observable, count: computed, threshold: computed, add: action, clear: action });
  }

  add(data: string): boolean {
    return this.addItem(JSON.parse(data));
  }

  addItem(item: PlainSecretItem) {
    try {
      if (true !== this.validator(item)) return false;
      if (this.shards.find((i) => i.root === item.root)) return false;
    } catch (error) {
      return false;
    }

    runInAction(() => this.shards.push(item));

    if (this.count >= this.threshold) this.combine();

    return true;
  }

  private combine() {
    try {
      const entropy = secretjs.combine(this.shards.map((s) => s.root));
      const mnemonic = utils.entropyToMnemonic(Buffer.from(entropy, 'hex'));
      if (!utils.isValidMnemonic(mnemonic)) return;

      this.emit('combined', mnemonic);
    } catch (error) {
      this.emit('combineError', error as Error);
      __DEV__ && console.error(error);
    }
  }

  async save(mnemonic: string) {
    const root = utils.HDNode.fromMnemonic(mnemonic);
    const protector = root.derivePath(`m/0'/3`);
    const bip32 = root.derivePath(this.info.bip32Path || DEFAULT_DERIVATION_PATH);
    const id = sha256Sync(protector.address).substring(0, 32);

    const key = (await MultiSigKey.findOne({ where: { id } })) ?? new MultiSigKey();

    key.id = id;
    key.bip32Xpubkey = xpubkeyFromHDNode(bip32);
    key.basePath = this.info?.bip32Path || DEFAULT_DERIVATION_PATH;
    key.basePathIndex = this.info?.bip32PathIndex || 0;

    key.secretsInfo = {
      threshold: this.threshold,
      version: this.info.version,
      distributedCount: this.shards.length + 1,
      devices: this.shards.map((a) => {
        return { ...a.device!, distributedAt: Date.now(), lastUsedAt: Date.now() };
      }),
    };

    const rootShard = secretjs.newShare(
      1,
      this.shards.map((s) => s.root)
    );

    const bip32Shard = secretjs.newShare(
      1,
      this.shards.map((s) => s.bip32)
    );

    key.secrets = {
      bip32Shard: await Authentication.encrypt(bip32Shard),
      rootShard: await Authentication.encrypt(rootShard),
      verifySignKey: await Authentication.encrypt(protector.privateKey.substring(2)),
    };

    key.save();
  }

  clear() {
    this.shards = [];
  }
}
