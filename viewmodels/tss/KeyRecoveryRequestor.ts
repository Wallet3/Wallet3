import { ContentType, KeyManagementService, OneTimeKeyExchange, PairingCodeVerified, RecoveryKeyAck } from './Constants';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import Bonjour from '../../common/p2p/Bonjour';
import { KeyRecovery } from './KeyRecovery';
import { LanServices } from './management/Common';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import eccrypto from 'eccrypto';
import { randomBytes } from 'crypto';
import { sha256Sync } from '../../utils/cipher';
import { sleep } from '../../utils/async';

type Events = {
  saving: () => void;
  saved: () => void;
};

export class KeyRecoveryRequestor extends TCPServer<Events> {
  private recovery = new KeyRecovery();
  readonly device = getDeviceInfo();

  pendingClients: TCPClient[] = [];
  aggregated = false;
  lastError: Error | null = null;

  get received() {
    return this.recovery.count;
  }

  get threshold() {
    return this.recovery.threshold;
  }

  get pendingCount() {
    return this.pendingClients.length;
  }

  get name() {
    return `kr-${this.device.globalId.substring(0, 12)}`;
  }

  constructor() {
    super();

    makeObservable(this, {
      pendingClients: observable,
      aggregated: observable,
      received: computed,
      threshold: computed,
      pendingCount: computed,
      lastError: observable,
    });

    this.recovery.once('combined', this.save);
    this.recovery.once('combineError', (e) => runInAction(() => (this.lastError = e)));
  }

  save = async (mnemonic: string) => {
    runInAction(() => (this.aggregated = true));
    this.emit('saving');

    await sleep(100);
    await this.recovery.save(mnemonic);

    this.emit('saved');
  };

  async start(): Promise<boolean> {
    if (super.listening) return true;

    const succeed = await super.start();

    Bonjour.publishService(KeyManagementService, this.name, this.port!, {
      role: 'primary',
      func: LanServices.RequestKeyRecovery,
      info: btoa(JSON.stringify(getDeviceBasicInfo())),
      protocol: 1,
      reqId: randomBytes(8).toString('hex'),
    });

    return succeed;
  }

  protected async newClient(c: TCPClient): Promise<void> {
    runInAction(() => this.pendingClients.push(c));

    c.once('close', () => {
      const index = this.pendingClients.indexOf(c);
      index >= 0 && runInAction(() => this.pendingClients.splice(index, 1));
    });

    const { hash } = JSON.parse((await c.secureReadString())!) as PairingCodeVerified;

    if (sha256Sync(c.pairingCode) !== hash) {
      c.destroy();
      return;
    }

    runInAction(() => this.pendingClients.splice(this.pendingClients.indexOf(c), 1));

    const oneTimeKey = randomBytes(32);
    const oneTimeEx: OneTimeKeyExchange = {
      type: ContentType.oneTimeKeyExchange,
      pubkey: eccrypto.getPublic(oneTimeKey).toString('hex'),
    };

    await c.secureWriteString(JSON.stringify(oneTimeEx));

    const secret: RecoveryKeyAck = JSON.parse((await c.secureReadString())!);

    const [bip32, root] = await Promise.all(
      [secret.bip32, secret.root].map(async (ecies) => {
        const plain = await eccrypto.decrypt(oneTimeKey, {
          iv: Buffer.from(ecies.iv, 'hex'),
          ciphertext: Buffer.from(ecies.ciphertext, 'hex'),
          ephemPublicKey: Buffer.from(ecies.ephemPublicKey, 'hex'),
          mac: Buffer.from(ecies.mac, 'hex'),
        });

        return plain.toString('utf8');
      })
    );

    this.recovery.addItem({ ...secret, bip32, root });
  }

  dispose() {
    Bonjour.unpublishService(this.name);
    this.recovery.removeAllListeners();
    this.removeAllListeners();
    this.pendingClients.forEach((c) => c.destroy());
    super.stop();
  }
}
