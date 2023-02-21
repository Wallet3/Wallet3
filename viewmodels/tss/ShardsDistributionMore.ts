import { IShardsDistributorConstruction, ShardsDistributor } from './ShardsDistributor';
import secretjs, { share } from 'secrets.js-grempe';

import MultiSigKey from '../../models/entities/MultiSigKey';
import { utils } from 'ethers';

interface IConstruction {
  rootEntropy: string;
  shares: string[];
  key: MultiSigKey;
}

export class ShardsDistributionMore extends ShardsDistributor {
  private key: MultiSigKey;
  private shares: string[];

  constructor({ rootEntropy, shares, key }: IConstruction) {
    super({ mnemonic: utils.entropyToMnemonic(rootEntropy), basePath: key.basePath, basePathIndex: key.basePathIndex });
    this.key = key;
    this.shares = shares;
  }

  get clientsOK(): boolean {
    return this.approvedCount >= 1;
  }

  setThreshold(_: number): void {
    throw new Error(`Can't set threshold`);
  }

  async distributeSecret(): Promise<MultiSigKey | undefined> {
    for (let client of this.approvedClients) {
      const newShare = secretjs.newShare(this.key.secretsInfo.distributedCount++, this.shares);
      client.secureReadString;
    }

    await this.key.save();
    return this.key;
  }
}
