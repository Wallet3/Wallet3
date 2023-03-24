import { BigNumber, BigNumberish, providers } from 'ethers';

import { ITokenMetadata } from '../../common/tokens';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import { UserOperationStruct } from '@account-abstraction/contracts/dist/types/EntryPoint';

type GasOptions = { maxFeePerGas?: BigNumberish; maxPriorityFeePerGas?: BigNumberish };
type FeeOptions = { feeToken?: ITokenMetadata | null };
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

  async createUnsignedUserOpForCreate2(args: Create2Options, opts?: FeeOptions & GasOptions) {
    const callData = await this.encodeCreate2(args.value, args.salt, args.bytecode);
    return this.createUnsignedUserOpForCallData(callData, opts);
  }

  async createUnsignedUserOpForTransactionRequests(txs: providers.TransactionRequest[], opts?: FeeOptions & GasOptions) {
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

  async createUnsignedUserOpForCallData(callData: string, opts?: FeeOptions & GasOptions) {
    console.log('createUnsignedUserOpForCallData');
    const phantom = await this.checkAccountPhantom();

    let callGasLimit = BigNumber.from(phantom ? 320_000 : 120_000);
    try {
      callGasLimit = await this.provider.estimateGas({
        from: this.entryPointAddress,
        to: await this.getAccountAddress(),
        data: callData,
      });
    } catch (error) {
      console.log(error);
    }

    const initCode = await this.getInitCode();

    const initGas = await this.estimateCreationGas(initCode);
    const verificationGasLimit = BigNumber.from(await this.getVerificationGasLimit())
      .add(initGas)
      .add(this.paymasterAPI ? (phantom ? 320_000 : 100_000) : 0);

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

    if (this.paymasterAPI) {
      // fill (partial) preVerificationGas (all except the cost of the generated paymasterAndData)
      const userOpForPm = {
        ...partialUserOp,
        preVerificationGas: await this.getPreVerificationGas(partialUserOp),
      };

      partialUserOp.paymasterAndData = (await this.paymasterAPI.getPaymasterAndData(userOpForPm)) || '0x';
    }

    console.log('preVerificationGas bf', partialUserOp.preVerificationGas, partialUserOp.verificationGasLimit.toString());

    return {
      ...partialUserOp,
      preVerificationGas: await this.getPreVerificationGas(partialUserOp),
      signature: '',
    };
  }

  async createSignedUserOpForTransactions(transactions: TransactionDetailsForUserOp[], opts?: GasOptions) {
    const op = await this.createUnsignedUserOpForTransactions(transactions, opts);
    console.log('preVerificationGas af', op.preVerificationGas);
    return super.signUserOp(op);
  }

  async createSignedUserOpForCreate2(args: Create2Options, gas?: GasOptions) {
    return super.signUserOp(await this.createUnsignedUserOpForCreate2(args, gas));
  }
}
