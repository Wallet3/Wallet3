import { getDeviceBasicInfo, getDeviceInfo } from '../../common/p2p/Utils';

import Bonjour from '../../common/p2p/Bonjour';
import { KeyRecovery } from './KeyRecovery';
import { KeyRecoveryService } from './Constants';
import { LanServices } from './management/DistributorDiscovery';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import { btoa } from 'react-native-quick-base64';
import { genEmojis } from '../../utils/emoji';

export class KeyRecoveryRequestor extends TCPServer<{}> {
  private recovery = new KeyRecovery();

  readonly avatar = genEmojis(4);
  readonly device = getDeviceInfo(this.avatar);

  constructor() {
    super();
  }

  get name() {
    return `kr-${this.device.globalId}`;
  }

  async start(): Promise<boolean> {
    const succeed = await super.start();
    if (super.listening) return true;

    Bonjour.publishService(KeyRecoveryService, this.name, this.port!, {
      role: 'primary',
      func: LanServices.ShardsDistribution,
      info: btoa(JSON.stringify(getDeviceBasicInfo(this.avatar))),
      protocol: 1,
    });

    return succeed;
  }

  protected newClient(_: TCPClient): void {}

  dispose() {
    super.stop();
  }
}
