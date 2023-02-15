import { ContentType, PairingCodeVerified, ShardAcknowledgement, ShardDistribution } from './Constants';
import Validator, { AsyncCheckFunction, SyncCheckFunction } from 'fastest-validator';
import { makeObservable, observable, runInAction } from 'mobx';

import EventEmitter from 'eventemitter3';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';
import { createHash } from 'crypto';
import eccrypto from 'eccrypto';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';
import { sleep } from '../../utils/async';
import { startLayoutAnimation } from '../../utils/animations';

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
    const data = JSON.parse(await this.secureReadString()) as { type: ContentType };

    switch (data.type) {
      case ContentType.shardDistribution:
        await this.handleShardDistribution(data as ShardDistribution);
        break;
      case ContentType.pairingCodeVerified:
        this.handlePairingCode(data as PairingCodeVerified);
        break;
    }
  };

  private handleShardDistribution = async (data: ShardDistribution) => {
    runInAction(() => (this.secretStatus = ShardPersistentStatus.verifying));
    await sleep(1000);

    __DEV__ && console.log(data);

    const { rootShard, rootSignature, bip32Shard, bip32Signature, pubkey } = data;

    const [validRoot, validBip32] = await Promise.all([
      verifyEccSignature(pubkey, rootShard, rootSignature),
      verifyEccSignature(pubkey, bip32Shard, bip32Signature),
    ]);

    const validSignature = validRoot && validBip32;

    this.emit((validSignature ? 'dataVerified' : 'dataVerifyFailed') as any);

    await sleep(1000);

    const ack: ShardAcknowledgement = {
      type: ContentType.shardAcknowledgement,
      distributionId: data.distributionId,
      success: validSignature,
    };

    try {
      if (!validSignature) return;

      const key = new ShardKey();
      key.id = data.distributionId;
      key.ownerDevice = this.remoteInfo!;
      key.secrets = { bip32Shard, rootShard };
      key.secretsInfo = { threshold: data.threshold };
      key.lastUsedTimestamp = Date.now();
      key.save();

      ack.success = true;

      runInAction(() => (this.secretStatus = ShardPersistentStatus.saved));
    } catch (e) {
      ack.success = false;
      runInAction(() => (this.secretStatus = ShardPersistentStatus.saveFailed));
    } finally {
      await this.secureWriteString(JSON.stringify(ack));
    }
  };

  private handlePairingCode = async (data: PairingCodeVerified) => {
    const equals = createHash('sha256').update(this.pairingCode).digest('hex') === data.hash;
    runInAction(() => (this.pairingCodeVerified = equals));

    if (!equals) {
      showMessage({ message: i18n.t('multi-sign-msg-pairing-code-not-match'), type: 'danger' });
      this.destroy();
      return;
    }

    this.onReady();
  };

  dispose() {
    this.raw.destroy();
    this.removeAllListeners();
  }
}
