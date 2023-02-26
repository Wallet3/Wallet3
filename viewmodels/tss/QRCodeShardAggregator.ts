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

  constructor() {
    makeObservable(this, { shards: observable, count: computed, add: action });
  }

  add(data: string) {
    let item: SecretItem;

    try {
      item = JSON.parse(data);
      if (true !== this.validator(item)) return;
    } catch (error) {
      return;
    }

    if (this.shards.find((i) => i.shard === item.shard)) return;
    this.shards.push(item);
    if (this.count >= item.threshold) this.combine();
  }

  combine() {}
}
