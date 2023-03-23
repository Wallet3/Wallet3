import { ITokenMetadata } from '../../common/tokens';
import { PaymasterAPI } from '@account-abstraction/sdk';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { utils } from 'ethers';

export class Wallet3Paymaster extends PaymasterAPI {
  paymasterAddress: string;
  feeToken: ITokenMetadata;

  constructor(paymasterAddress: string, feeToken: ITokenMetadata) {
    super();
    this.paymasterAddress = paymasterAddress;
    this.feeToken = feeToken;
  }

  async getPaymasterAndData(_: Partial<UserOperationStruct>): Promise<string | undefined> {
    const result = utils.solidityPack(['address', 'address'], [this.paymasterAddress, this.feeToken.address]);
    console.log('paymaster', result);
    return result;
  }
}
