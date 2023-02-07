interface Change {
  assetType: string;
  changeType: string;
  from: string;
  to: string;
  rawAmount: string;
  contractAddress: string;
  tokenId?: any;
  decimals: number;
  symbol: string;
  name: string;
  logo: string;
  amount: string;
}

export interface AssetChangeResult {
  changes: Change[];
  gasUsed: string;
  error?: any;
}
