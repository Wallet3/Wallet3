import { BigNumber, BigNumberish } from 'ethers';

import { SimpleAccount } from '@wallet3/account-abstraction-contracts';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import { UserOperationStruct } from '@account-abstraction/contracts/dist/types/EntryPoint';

export class ERC4337Client extends SimpleAccountAPI {
  async createUnsignedUserOpForTransactions(
    transactions: TransactionDetailsForUserOp[],
    opts?: { maxFeePerGas?: BigNumberish; maxPriorityFeePerGas?: BigNumberish }
  ): Promise<UserOperationStruct> {
    const accountContract = await this._getAccountContract();
    const callData = (accountContract as unknown as SimpleAccount).interface.encodeFunctionData('executeBatch', [
      transactions.map((transaction) => transaction.target),
      transactions.map((tx) => tx.value || 0),
      transactions.map((transaction) => transaction.data),
    ]);

    const callGasLimit = await this.provider.estimateGas({
      from: this.entryPointAddress,
      to: this.getAccountAddress(),
      data: callData,
    });

    const initCode = await this.getInitCode();

    const initGas = await this.estimateCreationGas(initCode);
    const verificationGasLimit = BigNumber.from(await this.getVerificationGasLimit()).add(initGas);

    const feeData = opts ?? (await this.provider.getFeeData());
    const maxFeePerGas = feeData.maxFeePerGas ?? 0;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 0;

    const partialUserOp: any = {
      sender: this.getAccountAddress(),
      nonce: this.getNonce(),
      initCode,
      callData,
      callGasLimit,
      verificationGasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymasterAndData: '0x',
    };

    return {
      ...partialUserOp,
      preVerificationGas: await this.getPreVerificationGas(partialUserOp),
      signature: '',
    };
  }

  async createSignedUserOpForTransactions(
    transactions: TransactionDetailsForUserOp[],
    opts?: { maxFeePerGas?: BigNumberish; maxPriorityFeePerGas?: BigNumberish }
  ) {
    return super.signUserOp(await this.createUnsignedUserOpForTransactions(transactions, opts));
  }
}
