import { ContentType, OneTimeKeyExchange, PairingCodeVerified, ShardDistribution, ShardDistributionAck } from './Constants';
import { createHash, randomBytes } from 'crypto';
import { makeObservable, observable, runInAction } from 'mobx';
import { sha256, sha256Sync } from '../../utils/cipher';

import Authentication from '../auth/Authentication';
import PairedDevices from './management/PairedDevices';
import ShardKey from '../../models/entities/ShardKey';
import { TCPClient } from '../../common/p2p/TCPClient';
import eccrypto from 'eccrypto';
import i18n from '../../i18n';
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
  private oneTimeKey = randomBytes(32);

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
          if (!(await this.handlePairingCode(data as PairingCodeVerified))) return;
          await this.oneTimeKeyExchange();
          break;
      }
    }
  };

  private handleShardDistribution = async (data: ShardDistribution) => {
    runInAction(() => (this.secretStatus = ShardPersistentStatus.verifying));
    await sleep(1000);

    __DEV__ && console.log(data);

    const { secrets, verifyPubkey } = data;

    const [rootShard, bip32Shard] = await Promise.all(
      [secrets.rootShard, secrets.bip32Shard].map(async (ecies) => {
        const data = {
          iv: Buffer.from(ecies.iv, 'hex'),
          mac: Buffer.from(ecies.mac, 'hex'),
          ciphertext: Buffer.from(ecies.ciphertext, 'hex'),
          ephemPublicKey: Buffer.from(ecies.ephemPublicKey, 'hex'),
        };

        return (await eccrypto.decrypt(this.oneTimeKey, data)).toString('utf8');
      })
    );

    const [validRoot, validBip32] = await Promise.all([
      verifyEccSignature(verifyPubkey, rootShard, secrets.rootSignature),
      verifyEccSignature(verifyPubkey, bip32Shard, secrets.bip32Signature),
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
        bip32Shard: await Authentication.encryptForever(bip32Shard),
        rootShard: await Authentication.encryptForever(rootShard),
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

    if (equals) return true;

    showMessage({ message: i18n.t('multi-sig-modal-msg-pairing-code-not-match'), type: 'danger' });
    this.destroy();
    return false;
  };

  private oneTimeKeyExchange = async () => {
    const data: OneTimeKeyExchange = {
      type: ContentType.oneTimeKeyExchange,
      pubkey: eccrypto.getPublic(this.oneTimeKey).toString('hex'),
    };

    await this.secureWriteString(JSON.stringify(data));
  };

  dispose() {
    super.destroy();
    this.removeAllListeners();
  }
}
