export const KeyDistributionService = 'wallet3_multiSign_key_distribution';
export const KeyAggregationService = 'wallet3_multiSign_key_aggregation';

export enum ContentType {
  shardDistribution = 1,
  shardDistributionAck,
  shardAggregationRequest,
  shardAggregationAck,
  pairingCodeVerified,
}

export type ShardDistribution = {
  type: ContentType.shardDistribution;
  secrets: { rootShard: string; bip32Shard: string; rootSignature: string; bip32Signature: string };
  secretsInfo: { threshold: number; bip32Path: string; bip32PathIndex: number; bip32Xpubkey: string; version: string };
  verifyPubkey: string;
  distributionId: string;
};

export type ShardDistributionAck = {
  type: ContentType.shardDistributionAck;
  distributionId: string;
  success: boolean;
};

export type ShardAggregationRequest = {
  type: ContentType.shardAggregationRequest;
  params: { subPath?: string; subPathIndex?: number; rootShard?: boolean; bip32Shard?: boolean };
  shardVersion: string;
};

export type ShardAggregationAck = {
  type: ContentType.shardAggregationAck;
  shard: string | { iv: string; ephemPublicKey: string; ciphertext: string; mac: string };
};

export type PairingCodeVerified = {
  type: ContentType.pairingCodeVerified;
  hash: string;
};
