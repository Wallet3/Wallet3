import { DateTimeFormatter } from '../../../utils/formatter';
import ShardKey from '../../../models/entities/ShardKey';
import dayjs from 'dayjs';

export class PairedDevice {
  shard: ShardKey;

  constructor(shard: ShardKey) {
    this.shard = shard;
  }

  get id() {
    return this.shard.id;
  }

  get distributionId() {
    return this.shard.distributionId;
  }

  get deviceInfo() {
    return this.shard.ownerDevice;
  }

  get lastUsedTimestamp() {
    return dayjs(this.shard.lastUsedTimestamp).format(DateTimeFormatter);
  }
}
