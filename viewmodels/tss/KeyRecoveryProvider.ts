import { ContentType, PairingCodeVerified, ShardAggregationAck, ShardAggregationRequest } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import { PlainSecretItem } from './KeyRecovery';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';
import { getDeviceInfo } from '../../common/p2p/Utils';
import { randomBytes } from 'crypto';
import { randomInt } from '../../utils/math';
import { sha256Sync } from '../../utils/cipher';

interface IConstruction {
  shardKey: ShardKey;
  service: { host: string; port: number };
}

export class KeyRecoveryProvider extends TCPClient {
  private key: ShardKey;

  verified = false;
  distributed = false;

  constructor(args: IConstruction) {
    super(args);

    this.key = args.shardKey;
    makeObservable(this, { verified: observable, distributed: observable });
  }

  send = async (pin?: string) => {
    try {
      const [bip32Secret, rootSecret] = (await Authentication.decryptForever(
        [this.key.secrets.bip32Shard, this.key.secrets.rootShard],
        pin
      )) as string[];

      if (!bip32Secret || !rootSecret) return false;

      const data: PlainSecretItem = {
        bip32: bip32Secret,
        root: rootSecret,
        device: getDeviceInfo(),
        secretsInfo: this.key.secretsInfo,
      };

      super.secureWriteString(JSON.stringify(data));

      this.key.lastUsedTimestamp = Date.now();
      this.key.save();

      runInAction(() => (this.distributed = true));
      return true;
    } catch (error) {
      console.log(error);
    }

    return false;
  };

  verifyPairingCode = async (code: string) => {
    const success = code === this.pairingCode;
    runInAction(() => (this.verified = success));

    if (success) {
      const data: PairingCodeVerified = {
        r1: randomBytes(randomInt(1, 256)).toString('hex'),
        type: ContentType.pairingCodeVerified,
        hash: sha256Sync(code),
      };

      this.secureWriteString(JSON.stringify(data));
    }

    return success;
  };

  dispose() {
    super.destroy();
  }
}
