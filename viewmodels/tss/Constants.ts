export const MultiSignPrimaryServiceType = 'wallet3-multi-sign';

export enum ContentType {
  shardDistribution = 1,
  shardAcknowledgement,
  shardAggregation,
  pairingCodeVerified,
}

export type ShardDistribution = {
  type: ContentType.shardDistribution;
  rootShard: string;
  bip32Shard: string;
  rootSignature: string;
  bip32Signature: string;
  pubkey: string;
  distributionId: string;
  threshold: number;
};

export const ShardDistributionSchema = {
  type: ContentType.shardDistribution,
  shard: 'string',
  pubkey: 'string',
  distributionId: 'string',
  $$strict: true,
};

export type ShardAcknowledgement = {
  type: ContentType.shardAcknowledgement;
  distributionId: string;
  success: boolean;
};

export type PairingCodeVerified = {
  type: ContentType.pairingCodeVerified;
  hash: string;
};
