import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';
import { makeObservable, observable, runInAction } from 'mobx';

import Bonjour from '../../common/p2p/Bonjour';
import { KeyManagementService } from './Constants';
import { KeyRecovery } from './KeyRecovery';
import { LanServices } from './management/DistributorDiscovery';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import { genEmojis } from '../../utils/emoji';
import { randomBytes } from 'crypto';

export class KeyRecoveryRequestor extends TCPServer<{}> {
  private recovery = new KeyRecovery();

  readonly avatar = genEmojis(4);
  readonly device = getDeviceInfo(this.avatar);
  pendingClients: TCPClient[] = [];

  aggregated = false;
  received = 0;
  threshold = 0;

  constructor() {
    super();
    makeObservable(this, { pendingClients: observable, aggregated: observable, received: observable, threshold: observable });
  }

  get name() {
    return `kr-${this.device.globalId}`;
  }

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
    const pairingCode = await c.secureReadString();
  }

  dispose() {
    super.stop();
  }
}
