class KeyAggregator {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  get name() {
    return `key-aggregator-${this.id}`;
  }
}
