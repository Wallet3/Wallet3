interface Creator {
  account: string;
  value: number;
}

interface Attribute {
  key: string;
  value: string;
}

interface Content {
  url: string;
  representation: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

interface Meta {
  name: string;
  description: string;
  tags: any[];
  genres: any[];
  originalMetaUri: string;
  attributes: Attribute[];
  content: Content[];
  restrictions: any[];
}

interface Type {
  contract: string;
  tokenId: string;
}

interface Make {
  type: Type;
  value: string;
}

interface Type2 {
  contract: string;
  blockchain: string;
}

interface Take {
  type: Type2;
  value: string;
}

interface OriginFee {
  account: string;
  value: number;
}

interface Data {
  payouts: any[];
  originFees: OriginFee[];
}

interface BestSellOrder {
  id: string;
  fill: string;
  platform: string;
  status: string;
  makeStock: string;
  cancelled: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
  dbUpdatedAt: Date;
  makePrice: string;
  makePriceUsd: string;
  maker: string;
  make: Make;
  take: Take;
  salt: string;
  signature: string;
  pending: any[];
  data: Data;
}

interface Currency {
  contract: string;
}

interface LastSale {
  date: Date;
  seller: string;
  buyer: string;
  value: string;
  currency: Currency;
  price: string;
}

export interface RaribleItem {
  id: string;
  blockchain: string;
  collection: string;
  contract: string;
  tokenId: string;
  creators: Creator[];
  lazySupply: string;
  pending: any[];
  mintedAt: Date;
  lastUpdatedAt: Date;
  supply: string;
  meta: Meta;
  deleted: boolean;
  originOrders: any[];
  auctions: any[];
  totalStock: string;
  sellers: number;
  bestSellOrder: BestSellOrder;
  lastSale: LastSale;
}

export interface NftsByOwnerV2 {
  total: number;
  items: RaribleItem[];
}
