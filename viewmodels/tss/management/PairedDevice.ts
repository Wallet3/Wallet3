import ShardKey from '../../../models/entities/ShardKey';

export class PairedDevice {
  shard: ShardKey;

  constructor(shard: ShardKey) {
    this.shard = shard;
  }

  get id() {
    return this.shard.id;
  }

  get deviceInfo() {
    return this.shard.ownerDevice;
  }
}
