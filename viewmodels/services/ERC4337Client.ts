import { BigNumber, BigNumberish, providers } from 'ethers';

import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import { UserOperationStruct } from '@account-abstraction/contracts/dist/types/EntryPoint';

type GasOptions = { maxFeePerGas?: BigNumberish; maxPriorityFeePerGas?: BigNumberish };
type Create2Options = { value: BigNumberish; salt: string; bytecode: string };

export class ERC4337Client extends SimpleAccountAPI {
  async encodeCreate2(value: BigNumberish, salt: string, bytecode: string) {
    const ca = await this._getAccountContract();
    return ca.interface.encodeFunctionData('executeContractDeployment', [value, salt, bytecode]);
  }

  async encodeBatchExecute(targets: string[], values: BigNumberish[], data: string[]) {
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData('executeBatch', [targets, values, data]);
  }

  async createUnsignedUserOpForCreate2(args: Create2Options, gas?: GasOptions) {
    const callData = await this.encodeCreate2(args.value, args.salt, args.bytecode);
    return this.createUnsignedUserOpForCallData(callData, gas);
  }

  async createUnsignedUserOpForTransactionRequests(txs: providers.TransactionRequest[], opts?: GasOptions) {
    return this.createUnsignedUserOpForTransactions(
      txs.map((tx) => {
        return {
          target: tx.to!,
          data: tx.data! as string,
          value: tx.value,
        };
      }),
      opts
    );
  }

  async createUnsignedUserOpForTransactions(
    transactions: TransactionDetailsForUserOp[],
    opts?: GasOptions
  ): Promise<UserOperationStruct> {
    const callData = await this.encodeBatchExecute(
      transactions.map((transaction) => transaction.target),
      transactions.map((tx) => tx.value || 0),
      transactions.map((transaction) => transaction.data)
    );

    return this.createUnsignedUserOpForCallData(callData, opts);
  }

  async createUnsignedUserOpForCallData(callData: string, opts?: GasOptions) {
    const callGasLimit = await this.provider.estimateGas({
      from: this.entryPointAddress,
      to: await this.getAccountAddress(),
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

  async createSignedUserOpForTransactions(transactions: TransactionDetailsForUserOp[], opts?: GasOptions) {
    return super.signUserOp(await this.createUnsignedUserOpForTransactions(transactions, opts));
  }

  async createSignedUserOpForCreate2(args: Create2Options, gas?: GasOptions) {
    return super.signUserOp(await this.createUnsignedUserOpForCreate2(args, gas));
  }
}
