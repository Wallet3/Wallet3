interface Contract {
  address: string;
}

interface TokenMetadata {
  tokenType: string;
}

interface Id {
  tokenId: string;
  tokenMetadata: TokenMetadata;
}

interface TokenUri {
  raw: string;
  gateway: string;
}

interface Medium {
  raw: string;
  gateway: string;
  thumbnail: string;
  format: string;
  bytes?: number;
}

interface Attribute {
  value: string;
  trait_type: string;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Attribute[];
  dna: string;
  metadata: any[];
  animation_url: string;
  id: string;
}

interface OpenSea {
  collectionName: string;
  safelistRequestStatus: string;
  imageUrl: string;
  description: string;
  externalUrl: string;
  lastIngestedAt: Date;
}

interface ContractMetadata {
  name: string;
  symbol: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  openSea: OpenSea;
  totalSupply: string;
}

interface SpamInfo {
  isSpam: string;
  classifications: string[];
}

interface OwnedNft {
  contract: Contract;
  id: Id;
  balance: string;
  title: string;
  description: string;
  tokenUri: TokenUri;
  media: Medium[];
  metadata: Metadata;
  timeLastUpdated: Date;
  contractMetadata: ContractMetadata;
  spamInfo: SpamInfo;
  error: string;
}

export interface AlchemyNFTs {
  ownedNfts: OwnedNft[];
  pageKey: string;
  totalCount: number;
  blockHash: string;
}
