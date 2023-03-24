import { providers, utils } from 'ethers';

import { AccountBase } from '../account/AccountBase';
import { ERC20Token } from '../../models/ERC20';
import { ITokenMetadata } from '../../common/tokens';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { UserOperationStruct } from '@account-abstraction/contracts';

export class Paymaster extends PaymasterAPI {
  address: string;
  feeToken: ITokenMetadata;
  erc20: ERC20Token;
  account: AccountBase;

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
  }

  async getPaymasterAndData(_: Partial<UserOperationStruct>): Promise<string | undefined> {
    const result = utils.solidityPack(['address', 'address'], [this.address, this.feeToken.address]);
    console.log('paymaster', result);
    return result;
  }

  buildApprove(): providers.TransactionRequest[] {
    const requests: providers.TransactionRequest[] = [];

    const amount = utils.parseUnits('100', this.feeToken.decimals);
    const approve = this.erc20.encodeApproveData(this.address, amount);
    requests.push({ to: this.feeToken.address, data: approve });

    return requests;
  }

  buildRevoke(): providers.TransactionRequest {
    const data = this.erc20.encodeApproveData(this.address, '0x0');
    return { to: this.feeToken.address, data };
  }
}
