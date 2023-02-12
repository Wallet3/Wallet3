import { ContentType, ShardAcknowledgement, ShardClientPairing, ShardDistribution } from './network/Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import { TCPClient } from '../../common/p2p/TCPClient';

export class KeyReceiver extends TCPClient {
  verified = false;

  constructor({ host, port }: { host: string; port: number }) {
    super({ service: { host, port } });

    makeObservable(this, { verified: observable });
    this.once('ready', this.onReady);
  }

  onReady = async () => {
    while (!this.closed) {
      const data = JSON.parse(await this.secureReadString()) as { type: ContentType };

      switch (data.type) {
        case ContentType.shardDistribution:
          this.handleShardDistribution(data as ShardDistribution);
          break;
        case ContentType.shardClientPairing:
          this.handleShardClientPairing(data as ShardClientPairing);
          break;
      }
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
  };

  private handleShardClientPairing = async (data: ShardClientPairing) => {
    if (data.code !== this.verificationCode) {
      this.destroy();
      return;
    }

    runInAction(() => (this.verified = true));
  };

  sendPairingCode = async (code: string) => {
    await this.secureWriteString(
      JSON.stringify({
        type: ContentType.shardClientPairing,
        code,
      })
    );
  };
}
