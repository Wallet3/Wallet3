export const MultiSignPrimaryServiceType = 'wallet3-multi-sign';

export enum ContentType {
  shardDistribution = 1,
  shardAcknowledgement,
  shardAggregation,
  pairingCodeVerified,
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

export type ShardVerifyCode = {
  type: ContentType.pairingCodeVerified;
};
