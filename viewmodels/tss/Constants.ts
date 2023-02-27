export const KeyManagementService = 'wallet3_multiSign_key_management';

export enum ContentType {
  shardDistribution = 1,
  shardDistributionAck,
  shardAggregationRequest,
  shardAggregationAck,
  pairingCodeVerified,
}

export type ShardDistribution = {
  r1: string;
  type: ContentType.shardDistribution;
  secrets: { rootShard: string; bip32Shard: string; rootSignature: string; bip32Signature: string };
  secretsInfo: {
    threshold: number;
    bip32Path: string;
    bip32PathIndex: number;
    bip32Xpubkey: string;
    version: string;
    mainAddress: string;
  };
  verifyPubkey: string;
  distributionId: string;
  r2: string;
};

export type ShardDistributionAck = {
  type: ContentType.shardDistributionAck;
  distributionId: string;
  success: boolean;
};

export type ShardAggregationRequest = {
  r1: string;
  type: ContentType.shardAggregationRequest;
  params: { subPath?: string; subPathIndex?: number; rootShard?: boolean; bip32Shard?: boolean };
  shardVersion: string;
  r2: string;
};

type EncryptedShard = { iv: string; ephemPublicKey: string; ciphertext: string; mac: string };

export type ShardAggregationAck = {
  type: ContentType.shardAggregationAck;
  rootShard?: EncryptedShard;
  bip32Shard?: EncryptedShard;
};

export type PairingCodeVerified = {
  r1: string;
  type: ContentType.pairingCodeVerified;
  hash: string;
  r2?: string;
};
