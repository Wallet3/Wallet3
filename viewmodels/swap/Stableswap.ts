import { BigNumber, BigNumberish, Contract } from 'ethers';
import StableswapABI from '../../abis/Stableswap.json';
import { getProviderByChainId } from '../../common/RPC';
import {
  DAI,
  FTM_DAI,
  FTM_USDC,
  IToken,
  MATIC_DAI,
  MATIC_USDC,
  MATIC_USDT,
  sUSD,
  USDC,
  USDT,
  wxDAI,
  xDAI_USDC,
  xDAI_USDT,
} from '../../common/tokens';

const TriPool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
const sUSDPool = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';

const Polygon_Aave_Pool = '0x445FE580eF8d70FF569aB36e80c647af338db351';

const xDai_TriPool = '0x7f90122BF0700F9E7e1F688fe926940E8839F353';

const ftm_2Pool = '0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40';

const Tokens: { [chain: number]: { tokens: IToken[]; targets: string[]; contract: string; underlying?: boolean } } = {
  1: {
    tokens: [DAI, USDC, USDT],
    targets: [TriPool, TriPool, TriPool],
    contract: '0x3D5f301C93476C0Ae7d2Eab2a369DE4cbb0700aB',
  },

  137: {
    tokens: [MATIC_DAI, MATIC_USDC, MATIC_USDT],
    targets: [Polygon_Aave_Pool, Polygon_Aave_Pool, Polygon_Aave_Pool],
    contract: '0x71d0e2881cEfEcf0e97499a0Cff6a6F470c05cfB',
    underlying: true,
  },

  100: {
    tokens: [wxDAI, xDAI_USDC, xDAI_USDT],
    targets: [xDai_TriPool, xDai_TriPool, xDai_TriPool],
    contract: '0x71d0e2881cEfEcf0e97499a0Cff6a6F470c05cfB',
  },

  250: {
    tokens: [FTM_DAI, FTM_USDC],
    targets: [ftm_2Pool, ftm_2Pool],
    contract: '0x71d0e2881cEfEcf0e97499a0Cff6a6F470c05cfB',
  },

  1337: {
    tokens: [DAI, USDC, USDT, sUSD],
    targets: [TriPool, TriPool, TriPool, sUSDPool],
    contract: '0xF16cC3B1B3c3072Ba1110e336212EF72C2Fa59cD',
  },
};

export class Stableswap {
  _fromTokens = Tokens;
  _forTokens = Tokens;

  getContractAddress(chainId: number) {
    return Tokens[chainId]?.contract ?? '';
  }

  fromTokens(chainId: number): IToken[] {
    return this._fromTokens[chainId]?.tokens ?? [];
  }

  forTokens(chainId: number): IToken[] {
    return this._forTokens[chainId]?.tokens ?? [];
  }

  async getAmountOut(chainId: number, from: IToken, to: IToken, amountIn: BigNumber): Promise<BigNumber | undefined> {
    const { tokens, targets, contract, underlying } = Tokens[chainId] ?? {};
    if (!tokens || !targets) return;

    const i = tokens.findIndex((t) => t.address === from.address);
    const j = tokens.findIndex((t) => t.address === to.address);
    const target = targets[i];

    const swap = new Contract(contract, StableswapABI, getProviderByChainId(chainId));
    return await swap.get_dy(target, i, j, amountIn, underlying ?? false);
  }

  encodeSwapData(chainId: number, from: IToken, to: IToken, amountIn: BigNumberish, minAmountOut: BigNumberish) {
    const { tokens, targets, contract, underlying } = Tokens[chainId] ?? {};
    if (!tokens) return;

    const i = tokens.findIndex((t) => t.address === from.address);
    const j = tokens.findIndex((t) => t.address === to.address);
    const target = targets[i];

    const swap = new Contract(contract, StableswapABI, getProviderByChainId(chainId));
    return swap.interface.encodeFunctionData('exchange', [
      target,
      i,
      from.address,
      j,
      to.address,
      amountIn,
      minAmountOut,
      underlying ?? false,
    ]);
  }
}

export default new Stableswap();
