export const MultiSignPrimaryServiceType = 'wallet3-multi-sign';

export enum ContentType {
  shardDistribution = 1,
  shardAcknowledgement,
  shardAggregation,
  pairingCodeVerified,
}

export type ShardDistribution = {
  type: ContentType.shardDistribution;
  secrets: { rootShard: string; bip32Shard: string; rootSignature: string; bip32Signature: string };
  secretsInfo: { threshold: number; bip32Path: string; bip32PathIndex: number; bip32Xpubkey: string; version: string };
  verifyPubkey: string;
  distributionId: string;
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
