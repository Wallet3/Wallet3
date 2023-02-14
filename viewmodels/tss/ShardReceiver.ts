import { ContentType, PairingCodeVerified, ShardAcknowledgement, ShardDistribution } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import { TCPClient } from '../../common/p2p/TCPClient';
import { createHash } from 'crypto';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

export class ShardReceiver extends TCPClient {
  shardSaved = false;
  pairingCodeVerified = false;

  constructor({ host, port }: { host: string; port: number }) {
    super({ service: { host, port } });

    makeObservable(this, { shardSaved: observable, pairingCodeVerified: observable });
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
    console.log(data);

    const ack: ShardAcknowledgement = {
      distributionId: data.distributionId,
      success: true,
      type: ContentType.shardAcknowledgement,
    };

    await this.secureWriteString(JSON.stringify(ack));

    runInAction(() => (this.shardSaved = true));
  };

  private handlePairingCode = async (data: PairingCodeVerified) => {
    const equals = createHash('sha256').update(this.verificationCode).digest('hex') === data.hash;
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
