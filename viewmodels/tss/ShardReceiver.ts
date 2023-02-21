import { ContentType, PairingCodeVerified, ShardDistribution, ShardDistributionAck } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import Authentication from '../auth/Authentication';
import PairedDevices from './management/PairedDevices';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';
import { createHash } from 'crypto';
import eccrypto from 'eccrypto';
import i18n from '../../i18n';
import { sha256Sync } from '../../utils/cipher';
import { showMessage } from 'react-native-flash-message';
import { sleep } from '../../utils/async';

export enum ShardPersistentStatus {
  waiting,
  verifying,
  saved,
  saveFailed,
}

async function verifyEccSignature(pubkey: string, msg: string, signature: string) {
  try {
    await eccrypto.verify(
      Buffer.from(pubkey, 'hex'),
      createHash('sha256').update(msg).digest(),
      Buffer.from(signature, 'hex')
    );

    return true;
  } catch (error) {
    return false;
  }
}

export class ShardReceiver extends TCPClient {
  secretStatus = ShardPersistentStatus.waiting;
  pairingCodeVerified = false;

  constructor({ host, port }: { host: string; port: number }) {
    super({ service: { host, port } });

    makeObservable(this, { secretStatus: observable, pairingCodeVerified: observable });
    this.once('ready', this.onReady);
  }

  onReady = async () => {
    while (!this.closed) {
      const data = JSON.parse((await this.secureReadString())!) as { type: ContentType };
      if (!data) break;

      switch (data.type) {
        case ContentType.shardDistribution:
          await this.handleShardDistribution(data as ShardDistribution);
          return;
        case ContentType.pairingCodeVerified:
          await this.handlePairingCode(data as PairingCodeVerified);
          break;
      }
    }

    console.log('socket successfully exits');
  };

  private handleShardDistribution = async (data: ShardDistribution) => {
    runInAction(() => (this.secretStatus = ShardPersistentStatus.verifying));
    await sleep(1000);

    __DEV__ && console.log(data);

    const { secrets, verifyPubkey } = data;

    const [validRoot, validBip32] = await Promise.all([
      verifyEccSignature(verifyPubkey, secrets.rootShard, secrets.rootSignature),
      verifyEccSignature(verifyPubkey, secrets.bip32Shard, secrets.bip32Signature),
    ]);

    const validSignature = validRoot && validBip32;

    this.emit((validSignature ? 'dataVerified' : 'dataVerifyFailed') as any);

    await sleep(1000);

    const ack: ShardDistributionAck = {
      type: ContentType.shardDistributionAck,
      distributionId: data.distributionId,
      success: validSignature,
    };

    try {
      if (!validSignature) return;

      const key = new ShardKey();
      key.id = `${this.remoteInfo!.globalId}-${data.distributionId}`;
      key.distributionId = data.distributionId;
      key.ownerDevice = this.remoteInfo!;
      key.secretsInfo = { ...data.secretsInfo, verifyPubkey };
      key.createdAt = Date.now();
      key.lastUsedTimestamp = Date.now();
      key.secrets = {
        bip32Shard: await Authentication.encryptForever(secrets.bip32Shard),
        rootShard: await Authentication.encryptForever(secrets.rootShard),
      };

      await key.save();

      ack.success = true;

      runInAction(() => (this.secretStatus = ShardPersistentStatus.saved));
      PairedDevices.addShardKey(key);
    } catch (e) {
      ack.success = false;
      runInAction(() => (this.secretStatus = ShardPersistentStatus.saveFailed));
    } finally {
      await this.secureWriteString(JSON.stringify(ack));
    }
  };

  private handlePairingCode = async (data: PairingCodeVerified) => {
    const equals = sha256Sync(this.pairingCode) === data.hash;
    runInAction(() => (this.pairingCodeVerified = equals));

    if (!equals) {
      showMessage({ message: i18n.t('multi-sig-modal-msg-pairing-code-not-match'), type: 'danger' });
      this.destroy();
      return;
    }
  };

  dispose() {
    super.destroy();
    this.removeAllListeners();
  }
}
