import { DAY } from '../../../utils/time';
import { DateTimeFormatter } from '../../../utils/formatter';
import ShardKey from '../../../models/entities/ShardKey';
import dayjs from 'dayjs';

export class PairedDevice {
  shard: ShardKey;

  constructor(shard: ShardKey) {
    this.shard = shard;
  }

  get bonjourDistributorName() {
    return `sd-${this.deviceInfo.globalId.substring(0, 12)}-${this.distributionId}`;
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

  get secretsInfo() {
    return this.shard.secretsInfo;
  }

  get createdAt() {
    return dayjs(this.shard.createdAt).format(DateTimeFormatter);
  }

  get lastUsedTimestamp() {
    return dayjs(this.shard.lastUsedTimestamp).format(DateTimeFormatter);
  }

  get threshold() {
    return this.shard.secretsInfo.threshold;
  }

  get expired() {
    return this.shard.lastUsedTimestamp < Date.now() - 30 * DAY;
  }

  get mainAddress() {
    return this.shard.secretsInfo.mainAddress;
  }

  remove() {
    this.shard.remove();
  }
}
