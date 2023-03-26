import { BigNumber, BigNumberish, Contract, providers, utils } from 'ethers';
import { ITokenMetadata, USDT } from '../../common/tokens';

import { AccountBase } from '../account/AccountBase';
import { ERC20Token } from '../../models/ERC20';
import { IFungibleToken } from '../../models/Interfaces';
import { INetwork } from '../../common/Networks';
import OracleABI from '../../abis/TokenOracle.json';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { getHash } from '../../configs/secret';

export class Paymaster extends PaymasterAPI {
  private erc20: ERC20Token;

  address: string;
  feeToken: IFungibleToken;
  account: AccountBase;
  oracle: Contract;
  network: INetwork;

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
    this.oracle = new Contract(this.address, OracleABI, opts.provider);

    this.erc20 = new ERC20Token({ owner: this.address, chainId: this.network.chainId, contract: this.feeToken.address });
  }

  setFeeToken(token: IFungibleToken) {
    this.feeToken = token;
  }

  async isServiceAvailable(necessaryGasWei: BigNumberish) {
    try {
      const balance: BigNumber = await this.oracle.getDeposit();
      return balance.gte(necessaryGasWei);
    } catch (error) {}

    return false;
  }

  async getFeeTokenAmount(totalGas: BigNumberish, erc20: string) {
    if (this.feeToken.isNative) return BigNumber.from(totalGas);

    try {
      const erc20Amount: BigNumber = await this.oracle.getTokenValueOfEth(erc20, totalGas);
      return erc20Amount;
    } catch (error) {}
  }

  async getPaymasterAndData(_: Partial<UserOperationStruct>): Promise<string | undefined> {
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

  async buildApprove(feeAmount: BigNumber): Promise<providers.TransactionRequest[]> {
    if (this.feeToken.isNative) return [];

    const requests: providers.TransactionRequest[] = [];

    const allowance = await this.feeToken.allowance(this.account.address, this.address);
    if (allowance.gte(feeAmount)) return [];

    if (this.feeToken.address === USDT.address && allowance.gt(0)) {
      const zero = this.erc20.encodeApproveData(this.address, 0);
      requests.push({ to: this.feeToken.address, data: zero });
    }

    const approve = this.erc20.encodeApproveData(this.address, feeAmount.mul(2));
    requests.push({ to: this.feeToken.address, data: approve });

    return requests;
  }
}
