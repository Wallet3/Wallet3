import { BigNumber, BigNumberish, Contract, providers, utils } from 'ethers';

import { AccountBase } from '../account/AccountBase';
import { ERC20Token } from '../../models/ERC20';
import { ITokenMetadata } from '../../common/tokens';
import OracleABI from '../../abis/TokenOracle.json';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { getHash } from '../../configs/secret';

export class Paymaster extends PaymasterAPI {
  address: string;
  feeToken: ITokenMetadata;
  erc20: ERC20Token;
  account: AccountBase;
  oracle: Contract;

  constructor(opts: {
    paymasterAddress: string;
    feeToken: ITokenMetadata;
    provider: providers.JsonRpcProvider;
    account: AccountBase;
  }) {
    super();
    this.address = opts.paymasterAddress;
    this.feeToken = opts.feeToken;
    this.account = opts.account;
    this.erc20 = new ERC20Token({ owner: this.address, chainId: 1, contract: this.feeToken.address });
    this.oracle = new Contract(this.address, OracleABI, opts.provider);
  }

  async getTokenAmount(totalGas: BigNumberish, erc20: string) {
    try {
      const erc20Amount: BigNumberish = await this.oracle.getTokenValueOfEth(erc20, totalGas);
      return BigNumber.from(erc20Amount);
    } catch (error) {}
  }

  async getPaymasterAndData(_: Partial<UserOperationStruct>): Promise<string | undefined> {
    const result = utils.solidityPack(
      ['address', 'address', 'bytes'],
      [this.address, this.feeToken.address, await getHash(this.account.address)]
    );

    return result;
  }

  buildApprove(): providers.TransactionRequest[] {
    const requests: providers.TransactionRequest[] = [];

    const amount = utils.parseUnits('10', this.feeToken.decimals);
    const approve = this.erc20.encodeApproveData(this.address, amount);
    requests.push({ to: this.feeToken.address, data: approve });

    return requests;
  }

  buildRevoke(): providers.TransactionRequest {
    const data = this.erc20.encodeApproveData(this.address, '0x0');
    return { to: this.feeToken.address, data };
  }
}
