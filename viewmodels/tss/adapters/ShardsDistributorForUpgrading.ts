import { IShardsDistributorConstruction, ShardsDistributor } from '../ShardsDistributor';

import MultiSigKey from '../../../models/entities/MultiSigKey';

interface IConstruction extends IShardsDistributorConstruction {
  upgradeCallback: (key?: MultiSigKey) => void;
}

export class DistributorForUpgrading extends ShardsDistributor {
  private args: IConstruction;

  constructor(args: IConstruction) {
    super(args);
    this.args = args;
  }

  async distributeSecret() {
    const key = await super.distributeSecret();
    this.args.upgradeCallback(key);
    return key;
  }
}
