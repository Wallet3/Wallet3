export enum ContentType {
  shardDistribution = 1,
  shardAcknowledgement,
  shardAggregation,
}

export type ShardDistribution = {
  type: ContentType.shardDistribution;
  shard: string;
  pubkey: string;
  distributionId: string;
};

export type ShardAcknowledgement = {
  type: ContentType.shardAcknowledgement;
  distributionId: string;
  success: boolean;
};
