export interface Creator {
  account: string;
  value: number;
}

export interface Royalty {
  account: string;
  value: number;
}

export interface Attribute {
  key: string;
  value: string;
}

export interface Url {
  ORIGINAL: string;
  BIG: string;
  PREVIEW: string;
}

export interface PREVIEW {
  type: string;
  width: number;
  height: number;
}

export interface Meta2 {
  PREVIEW?: PREVIEW;
}

export interface Image {
  url?: Url;
  meta?: Meta2;
}

export interface Url2 {
  ORIGINAL: string;
}

export interface ORIGINAL {
  type: string;
}

export interface Meta3 {
  ORIGINAL: ORIGINAL;
}

export interface Animation {
  url: Url2;
  meta: Meta3;
}

export interface Meta {
  name: string;
  description?: string;
  attributes?: Attribute[];
  image?: Image;
  animation?: Animation;
}

export interface Nft {
  id: string;
  contract: string;
  tokenId: string;
  creators: Creator[];
  supply: string;
  lazySupply: string;
  owners: string[];
  royalties: Royalty[];
  lastUpdatedAt: Date;
  mintedAt: Date;
  pending: any[];
  deleted: boolean;
  meta?: Meta;
}

export interface NftsByOwner {
  total: number;
  continuation: string;
  items: Nft[];
}
