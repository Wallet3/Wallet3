export interface Attribute {
  trait_type: string;
  value: any;
  display_type: string;
}

export interface Attributes {
  0: string;
  1: string;
  10: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  amount: string;
  author: string;
  blockNum: string;
  createdTime: string;
  erc20: string;
  grade: string;
  nftType: string;
  quality: string;
  resBaseId: string;
  resId: string;
  ruleId: string;
  tLevel: string;
}

export interface Data2 {
  attributes: Attributes;
  auction_image: string;
  big_image: string;
  description: string;
  external_url: string;
  i18n_description: string;
  i18n_name: string;
  id: string;
  name: string;
  small_image: string;
}

export interface Result {
  data: Data2;
}

export interface Metadata {
  attributes: Attribute[];
  background_color: string;
  description: string;
  external_url: string;
  image: string;
  name: string;
}

export interface Metadata2 {
  attributes: any;
  description: string;
  gif_url: string;
  image: string;
  mp4_url: string;
  name: string;
  webm_url: string;
  external_url: string;
  result: Result;
  status?: number;
}

interface Nft {
  contract_addr: string;
  contract_name: string;
  token_type: string;
  token_id: string;
  owner_addr: string;
  balance: string;
  token_uri: string;
  name: string;
  description: string;
  image: string;
}

export interface Nfts1155 extends Nft {
  metadata?: Metadata;
}

export interface Nfts721 extends Nft {
  metadata?: Metadata2;
}

export interface Data {
  nfts1155: Nfts1155[];
  nfts721: Nfts721[];
  total1155: number;
  total721: number;
}

export interface BounceResponse {
  code: number;
  data: Data;
  msg: string;
}
