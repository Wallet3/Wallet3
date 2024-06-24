import { AccountBase, SendTxRequest, SendTxResponse } from './AccountBase';
import { BigNumber, providers, utils } from 'ethers';
import { eth_call_return, getCode, getRPCUrls } from '../../common/RPC';
import { makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HttpRpcClient } from '@account-abstraction/sdk';
import { Paymaster } from '../services/erc4337/Paymaster';
import TxHub from '../hubs/TxHub';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { WalletBase } from '../wallet/WalletBase';
import { createERC4337Client } from '../services/erc4337/ERC4337';

const Keys = {
  accountActivated: (address: string, chainId: number) => `${chainId}_${address}_erc4337_activated`,
  activated: 'activated',
};

export class ERC4337Account extends AccountBase {
  readonly type = 'erc4337';
  readonly accountSubPath = `4337'/`;
  readonly activatedChains = new Map<number, boolean>();

  constructor(wallet: WalletBase, address: string, index: number, extra?: { signInPlatform?: string }) {
    super(wallet, address, index, extra);
    makeObservable(this, { activatedChains: observable });
  }

  async getNonce(chainId: number) {
    if (!(await this.checkActivated(chainId))) return BigNumber.from(0);

    const resp = await eth_call_return(chainId, { to: this.address, data: '0xd087d288' });
    if (!resp || resp.error) return BigNumber.from(0);

    return BigNumber.from(resp.result);
  }

  async checkActivated(chainId: number, cacheOnly = false) {
    if (this.activatedChains.get(chainId)) return true;
    if (cacheOnly) return false;

    const info = await AsyncStorage.getItem(Keys.accountActivated(this.address, chainId));
    if (info === Keys.activated) {
      runInAction(() => this.activatedChains.set(chainId, true));
      return true;
    }

    const code = await getCode(chainId, this.address);
    if (!code || code === '0x') return false;

    runInAction(() => this.activatedChains.set(chainId, true));
    AsyncStorage.setItem(Keys.accountActivated(this.address, chainId), Keys.activated);
    return true;
  }

  async sendTx(args: SendTxRequest, pin?: string): Promise<SendTxResponse> {
    if (!this.wallet) return { success: false, error: { message: 'Account not available', code: -1 } };

    let { tx, txs, network, gas, readableInfo, onNetworkRequest, paymaster } = args;
    if (!(tx || txs)) return { success: false };
    if (!network?.erc4337) return { success: false, error: { message: 'ERC4337 not supported', code: -1 } };

    const owner = await this.wallet.openWallet({
      accountIndex: this.index,
      subPath: this.wallet.ERC4337SubPath,
      disableAutoPinRequest: true,
      pin,
    });

    if (!owner) return { success: false };

    onNetworkRequest?.();

    const { bundlerUrls, entryPointAddress } = network.erc4337;

    const client = await createERC4337Client(network, owner, paymaster!, { accountAddress: this.address });
    if (!client) return { success: false };

    if (paymaster?.feeToken?.isNative === false) {
      txs = txs || [tx!];
      txs.unshift(...(await paymaster.buildApprove()));
    }

    let op!: UserOperationStruct;
    txs = txs || [tx!];

    if (tx && !utils.isAddress(tx!.to || '')) {
      op = await client.createSignedUserOpForCreate2(
        {
          bytecode: tx!.data as string,
          salt: utils.formatBytes32String(`${await this.getNonce(network.chainId)}`),
          value: tx?.value || '0x0',
        },
        gas
      );
    } else {
      const requests = txs.map((tx) => {
        return {
          target: utils.getAddress(tx.to!),
          value: tx.value || 0,
          data: (tx.data as string) || '0x',
        };
      });

      op = await client.createSignedUserOpForTransactions(requests, gas);
    }

    if (!op) return { success: false };

    for (const bundlerUrl of bundlerUrls) {
      const http = new HttpRpcClient(bundlerUrl, entryPointAddress, network.chainId);

      try {
        await http.validateChainId();
      } catch (error) {
        continue;
      }

      try {
        const opHash = await http.sendUserOpToBundler(op);

        TxHub.watchERC4337Op(network, opHash, op, { ...tx, readableInfo }).catch();

        const txHashPromise = new Promise<string>((resolve) => {
          const handler = (opId: string, txHash: string) => {
            try {
              if (opId !== opHash) return;
              resolve(txHash);
            } finally {
              TxHub.off('opHashResolved', handler);
            }
          };

          TxHub.on('opHashResolved', handler);
        });

        return { success: true, txHashPromise };
      } catch (error) {
        console.error(error);
      }
    }

    return { success: false, error: { message: 'Network error', code: -1 } };
  }
}
