import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { BigNumber, BigNumberish, providers, utils } from 'ethers';

import Transaction from './Transaction';
import { UserOperationStruct } from '@account-abstraction/contracts/dist/types/EntryPoint';

export type UserOperationS = {
  sender: string;
  nonce: BigNumberish;
  initCode: string;
  callData: string;
  callGasLimit: BigNumberish;
  verificationGasLimit: BigNumberish;
  preVerificationGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;
  paymasterAndData: string;
  signature: string;
};

export async function userOpsToJSON(op: Partial<UserOperationStruct>) {
  const userOp = await utils.resolveProperties(op);
  return Object.keys(userOp)
    .map((key) => {
      let val = (userOp as any)[key];
      if (typeof val !== 'string' || !val.startsWith('0x')) {
        val = utils.hexValue(val);
      }
      return [key, val];
    })
    .reduce(
      (set, [k, v]) => ({
        ...set,
        [k]: v,
      }),
      {}
    ) as UserOperationS;
}

@Entity({ name: '_dev_erc4337_txs_v1' })
export default class ERC4337Transaction extends Transaction {
  @PrimaryColumn()
  opHash!: string;

  get isERC4337() {
    return true;
  }
}
