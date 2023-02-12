export enum ContentType {
  shardClientPairing = 1,
  shardDistribution,
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

export type ShardClientPairing = {
  type: ContentType.shardClientPairing;
  code: string;
};
