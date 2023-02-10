export enum ContentType {
  shardDistribution = 1,
  shardAcknowledgement,
  shardAggregation,
}

export type ShardDistribution = {
  type: ContentType;
  shard: string;
  pubkey: string;
  distributionId: string;
};

export type ShardAcknowledgement = {
  type: ContentType;
  distributionId: string;
  success: boolean;
};
