import { ContentType, ShardAcknowledgement, ShardDistribution } from './network/Constants';

import { TCPClient } from '../../common/p2p/TCPClient';

export class KeyReceiver extends TCPClient {
  constructor({ host, port }: { host: string; port: number }) {
    super({ service: { host, port } });
    this.once('ready', this.onReady);
  }

  onReady = async () => {
    const data = JSON.parse(await this.secureReadString()) as ShardDistribution;

    if (data.type !== ContentType.shardDistribution) {
      return;
    }

    console.log(data);

    const ack: ShardAcknowledgement = {
      distributionId: data.distributionId,
      success: true,
      type: ContentType.shardAcknowledgement,
    };

    await this.secureWriteString(JSON.stringify(ack));
  };
}
