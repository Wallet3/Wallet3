import { ShardsAggregator } from './ShardsAggregator';
import { ShardsDistributor } from './ShardsDistributor';

export class ShardsReDistributor {
  private distributor!: ShardsDistributor;
  private aggregator!: ShardsAggregator;
}
