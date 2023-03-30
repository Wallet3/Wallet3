import { BigNumber, BigNumberish, Contract, ethers, providers, utils } from 'ethers';
import { ITokenMetadata, USDT } from '../../../common/tokens';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import { AccountBase } from '../../account/AccountBase';
import { ERC20Token } from '../../../models/ERC20';
import { IFungibleToken } from '../../../models/Interfaces';
import { INetwork } from '../../../common/Networks';
import OracleABI from '../../../abis/TokenOracle.json';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { getHash } from '../../../configs/secret';
import { getTokenPrice } from '../../../common/oracles';

export class Paymaster extends PaymasterAPI {
  private erc20: ERC20Token;
  private contract: Contract;
  private balance = BigNumber.from(0);
  private priceCache = new Map<string, number>();

  address: string;
  account: AccountBase;
  network: INetwork;

  feeToken: IFungibleToken | null;
  feeTokenWei = BigNumber.from(0);
  feeTokenPriceInUSD = 0;

  serviceUnavailable = false;
  loading = false;

  get insufficientFee() {
    return this.feeTokenWei.gt(this.feeToken?.balance || 0);
  }

  get feeTokenAmount() {
    if (!this.feeToken) return 0;

    try {
      return Number(utils.formatUnits(this.feeTokenWei, this.feeToken.decimals));
    } catch (error) {
      return 0;
    }
  }

  get feeTokenInUSD() {
    try {
      if (!this.feeTokenPriceInUSD) return 0;
      return this.feeTokenPriceInUSD * this.feeTokenAmount;
    } catch (error) {
      return 0;
    }
  }

  constructor(opts: {
    paymasterAddress: string;
    feeToken: IFungibleToken;
    provider: providers.JsonRpcProvider;
    account: AccountBase;
    network: INetwork;
  }) {
    super();
    this.address = opts.paymasterAddress;
    this.feeToken = opts.feeToken;
    this.account = opts.account;
    this.network = opts.network;
    this.contract = new Contract(this.address, OracleABI, opts.provider);
    this.erc20 = new ERC20Token({
      owner: this.address,
      chainId: this.network.chainId,
      contract: this.feeToken.address || ethers.constants.AddressZero,
    });

    makeObservable(this, {
      loading: observable,
      feeToken: observable,
      feeTokenWei: observable,
      feeTokenPriceInUSD: observable,
      serviceUnavailable: observable,
      insufficientFee: computed,
      feeTokenAmount: computed,

      calcFeeTokenAmount: action,
      setFeeTokenAndCalcTokenAmount: action,
    });
  }

  setFeeTokenAndCalcTokenAmount(token: IFungibleToken, totalGas: BigNumber) {
    if (this.serviceUnavailable) return;

    this.feeToken = token;
    this.feeTokenPriceInUSD = 0;
    token.getBalance();

    this.feeTokenWei = BigNumber.from(0);
    this.calcFeeTokenAmount(totalGas);
  }

  async isServiceAvailable(necessaryGasWei: BigNumber) {
    if (necessaryGasWei.eq(0)) return;
    let blocked = false;

    if (this.balance.eq(0)) {
      try {
        [this.balance, blocked] = await Promise.all([
          this.contract.getDeposit(),
          this.contract.isAccountBlocked(this.account.address),
        ]);
      } catch (error) {}
    }

    const unavailable = this.balance.lt(necessaryGasWei) || blocked;

    runInAction(() => {
      this.serviceUnavailable = unavailable;
      if (unavailable) this.feeToken = null;
    });
  }

  async calcFeeTokenAmount(totalGas: BigNumber) {
    if (!this.feeToken) return;

    if (this.feeToken.isNative) {
      this.feeTokenWei = totalGas;
      this.fetchTokenPrice(this.feeToken.address);
      return;
    }

    if (totalGas.eq(0)) {
      this.feeTokenWei = totalGas;
      return;
    }

    try {
      this.loading = true;
      const [erc20Wei] = await Promise.all([this.contract.getTokenValueOfEth(this.feeToken.address, totalGas)]);
      if (!this.feeToken.isStable) this.fetchTokenPrice(this.feeToken.address);

      runInAction(() => {
        this.feeTokenWei = erc20Wei as BigNumber;
        this.loading = false;
      });
    } catch (error) {}
  }

  private async fetchTokenPrice(address: string) {
    const cache = this.priceCache.get(address);
    if (cache) {
      runInAction(() => (this.feeTokenPriceInUSD = cache));
      return;
    }

    const price = (await getTokenPrice(this.network.chainId, address)) || 0;
    this.priceCache.set(address, price);

    runInAction(() => (this.feeTokenPriceInUSD = price));
  }

  async getPaymasterAndData(_: Partial<UserOperationStruct>): Promise<string | undefined> {
    if (!this.feeToken || this.feeToken.isNative) return '0x';

    const result = utils.solidityPack(
      ['address', 'address', 'bytes'],
      [
        this.address,
        this.feeToken.address,
        await getHash(this.account.address, await this.account.getNonce(this.network.chainId)),
      ]
    );

    return result;
  }

  async buildApprove(feeAmount: BigNumber = this.feeTokenWei): Promise<providers.TransactionRequest[]> {
    if (!this.feeToken) return [];
    if (this.feeToken.isNative) return [];

    const requests: providers.TransactionRequest[] = [];

    const allowance = await this.feeToken.allowance(this.account.address, this.address);
    if (allowance.gte(feeAmount.add(feeAmount.div(2)))) return [];

    if (this.feeToken.address === USDT.address && allowance.gt(0)) {
      const zero = this.erc20.encodeApproveData(this.address, 0);
      requests.push({ to: this.feeToken.address, data: zero });
    }

    const approve = this.erc20.encodeApproveData(this.address, feeAmount.mul(2));
    requests.push({ to: this.feeToken.address, data: approve });

    return requests;
  }
}
