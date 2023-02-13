import { ContentType, ShardAcknowledgement, ShardDistribution } from './Constants';
import { makeObservable, observable, runInAction } from 'mobx';

import { TCPClient } from '../../common/p2p/TCPClient';

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
        runInAction(() => (this.pairingCodeVerified = true));
        this.onReady();
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

    this.shardSaved = true;
  };
}
