import { KeyManagementService, PairingCodeVerified } from './Constants';
import { KeyRecovery, PlainSecretItem } from './KeyRecovery';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import Bonjour from '../../common/p2p/Bonjour';
import { LanServices } from './management/DistributorDiscovery';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import { genEmojis } from '../../utils/emoji';
import { randomBytes } from 'crypto';
import { sha256Sync } from '../../utils/cipher';
import { sleep } from '../../utils/async';

type Events = {
  saving: () => void;
  saved: () => void;
};

export class KeyRecoveryRequestor extends TCPServer<Events> {
  private recovery = new KeyRecovery();

  readonly avatar = genEmojis(4);
  readonly device = getDeviceInfo(this.avatar);
  pendingClients: TCPClient[] = [];

  aggregated = false;

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
    return `kr-${this.device.globalId}`;
  }

  constructor() {
    super();

    makeObservable(this, {
      pendingClients: observable,
      aggregated: observable,
      received: computed,
      threshold: computed,
      pendingCount: computed,
    });

    this.recovery.once('combined', this.save);
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

    console.log('requestor started');

    return succeed;
  }

  protected async newClient(c: TCPClient): Promise<void> {
    runInAction(() => this.pendingClients.push(c));
    c.once('close', () => runInAction(() => this.pendingClients.splice(this.pendingClients.indexOf(c), 1)));

    const { hash } = JSON.parse((await c.secureReadString())!) as PairingCodeVerified;

    if (sha256Sync(c.pairingCode) !== hash) {
      c.destroy();
      return;
    }

    runInAction(() => this.pendingClients.splice(this.pendingClients.indexOf(c), 1));

    const secret = await c.secureReadString();

    if (!secret) {
      c.destroy();
      return;
    }

    this.recovery.add(secret!);
  }

  dispose() {
    super.stop();
    this.recovery.removeAllListeners();
    this.removeAllListeners();
  }
}
