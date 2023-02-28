import { ClientInfo } from '../../common/p2p/Constants';

export const KeyManagementService = 'wallet3_multiSign_key_management';

export enum ContentType {
  shardDistribution = 1,
  shardDistributionAck,
  shardAggregationRequest,
  shardAggregationAck,
  pairingCodeVerified,
  oneTimeKeyExchange,
  recoveryKeyAck,
}

type EncryptedShard = { iv: string; ephemPublicKey: string; ciphertext: string; mac: string };

export type OneTimeKeyExchange = {
  type: ContentType.oneTimeKeyExchange;
  pubkey: string;
};

export type ShardDistribution = {
  type: ContentType.shardDistribution;
  secrets: { rootShard: EncryptedShard; bip32Shard: EncryptedShard; rootSignature: string; bip32Signature: string };
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
  rootShard?: EncryptedShard;
  bip32Shard?: EncryptedShard;
};

export type PairingCodeVerified = {
  type: ContentType.pairingCodeVerified;
  hash: string;
};

export type RecoveryKeyAck = {
  type: ContentType.recoveryKeyAck;
  root: EncryptedShard;
  bip32: EncryptedShard;
  device: ClientInfo;
  secretsInfo: {
    threshold: number;
    bip32Path: string;
    bip32PathIndex: number;
    bip32Xpubkey: string;
    version: string;
    verifyPubkey: string;
    mainAddress: string;
  };
};
