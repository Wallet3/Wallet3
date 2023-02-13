class ShardsAggregator {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  get name() {
    return `shards-aggregator-${this.id}`;
  }
}
