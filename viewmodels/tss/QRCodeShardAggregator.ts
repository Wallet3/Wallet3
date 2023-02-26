import Validator, { AsyncCheckFunction, SyncCheckFunction } from 'fastest-validator';
import { action, computed, makeObservable, observable } from 'mobx';

const QRSecretItemSchema = {
  secret: 'string',
  threshold: 'number',
  version: 'string',

  $$strict: false,
};

export type SecretItem = {
  shard: string;
  threshold: number;
  version: string;
};

export class QRCodeShardAggregator {
  private readonly validator = new Validator().compile(QRSecretItemSchema) as SyncCheckFunction;
  shards: SecretItem[] = [];

  get count() {
    return this.shards.length;
  }

  get threshold() {
    return this.shards[0]?.threshold ?? 0;
  }

  constructor() {
    makeObservable(this, { shards: observable, count: computed, add: action, clear: action });
  }

  add(data: string): boolean {
    let item: SecretItem;

    try {
      item = JSON.parse(data);
      if (true !== this.validator(item)) return false;
      if (this.shards.find((i) => i.shard === item.shard)) return false;
    } catch (error) {
      return false;
    }

    this.shards.push(item);
    if (this.count >= item.threshold) this.combine();

    return true;
  }

  combine() {}

  clear() {
    this.shards = [];
  }
}
