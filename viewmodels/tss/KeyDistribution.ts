import { action, computed, makeObservable, observable } from 'mobx';

import { HDNode } from 'ethers/lib/utils';
import LanDiscovery from '../../common/p2p/LanDiscovery';
import { MultiSignPrimaryServiceType } from '../../common/p2p/Constants';
import { TCPClient } from '../../common/p2p/TCPClient';
import { TCPServer } from '../../common/p2p/TCPServer';
import secretjs from 'secrets.js-grempe';
import { utils } from 'ethers';

type Events = {
  newClient: (client: TCPClient) => void;
};

interface IConstruction {
  mnemonic: string;
}

export class KeyDistribution extends TCPServer<Events> {
  readonly clients: TCPClient[] = [];
  readonly id: string;
  private rootEntropy: string;
  private root: HDNode;
  private protector: HDNode;

  constructor({ mnemonic }: IConstruction) {
    super();
    makeObservable(this, { clients: observable, clientCount: computed, approveClient: action, rejectClient: action });

    this.rootEntropy = utils.mnemonicToEntropy(mnemonic).substring(2);
    this.root = utils.HDNode.fromMnemonic(mnemonic);
    this.protector = this.root.derivePath(`m/0'/3`);
    this.id = utils.keccak256(this.protector.address).substring(2, 34);
  }

  get name() {
    return `key-distribution-${this.id}`;
  }

  get clientCount() {
    return this.clients.length;
  }

  async start(): Promise<void> {
    await super.start();

    LanDiscovery.publishService(MultiSignPrimaryServiceType, this.name, this.port!, {
      role: 'primary',
      func: 'key-distribution',
      distributionId: this.id,
    });
  }

  protected newClient(c: TCPClient): void {
    c.once('close', () => this.rejectClient(c));
    this.emit('newClient', c);
  }

  approveClient(client: TCPClient) {
    this.clients.push(client);
  }

  rejectClient(client: TCPClient) {
    const index = this.clients.indexOf(client);
    if (index < 0) return;

    this.clients.splice(index, 1);
  }

  async distributeSecret(threshold: number) {
    const shards = secretjs.share(this.rootEntropy, this.clientCount + 1, threshold);
    shards[0];

    await Promise.all(
      shards.slice(1).map((shard, index) =>
        this.clients[index].writeStringWithEncryption(
          JSON.stringify({
            shard,
            pubkey: this.protector.publicKey.substring(2),
            distributionId: this.id,
          })
        )
      )
    );
  }

  stop(): void {
    super.stop();
    LanDiscovery.unpublishService(this.name);
  }
}
