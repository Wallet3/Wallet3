import { AccountBase, SendTxRequest, SendTxResponse } from './AccountBase';
import { BigNumber, ethers, utils } from 'ethers';
import { HttpRpcClient, SimpleAccountAPI } from '@account-abstraction/sdk';
import { UserOperationS, userOpsToJSON } from '../../models/entities/ERC4337Transaction';
import { estimateGas, eth_call_return, getCode, getRPCUrls } from '../../common/RPC';
import { makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import TxHub from '../hubs/TxHub';
import { WalletBase } from '../wallet/WalletBase';
import { createERC4337Client } from '../services/ERC4337';

const Keys = {
  accountActivated: (address: string, chainId: number) => `${chainId}_${address}_erc4337_activated`,
  activated: 'activated',
};

export class ERC4337Account extends AccountBase {
  readonly type = 'erc4337';
  readonly activatedChains = new Map<number, boolean>();

  constructor(wallet: WalletBase, address: string, index: number, extra?: { signInPlatform?: string }) {
    super(wallet, address, index, extra);
    makeObservable(this, { activatedChains: observable });
  }

  async getNonce(chainId: number) {
    if (!(await this.checkActivated(chainId))) return 0;

    const resp = await eth_call_return(chainId, { to: this.address, data: '0xaffed0e0' });
    if (!resp || resp.error) return 0;

    return BigNumber.from(resp.result).toNumber();
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

    const { tx, txs, network, gas, readableInfo, onNetworkRequest } = args;
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

    const { bundlerUrls, entryPointAddress, factoryAddress } = network.erc4337;

    const client = await createERC4337Client(network.chainId, owner);
    if (!client) return { success: false };

    const op = Array.isArray(txs)
      ? await client.createSignedUserOpForTransactions(
          txs.map((tx) => {
            return {
              target: utils.getAddress(tx.to!),
              value: tx.value || 0,
              data: (tx.data as string) || '0x',
            };
          }),
          gas
        )
      : await client.createSignedUserOp({
          target: utils.getAddress(tx!.to!),
          value: tx!.value || 0,
          data: (tx!.data as string) || '0x',
          ...gas,
        });

    if (!op) return { success: false };

    for (let bundlerUrl of bundlerUrls) {
      const http = new HttpRpcClient(bundlerUrl, entryPointAddress, network.chainId);

      try {
        const opHash = await http.sendUserOpToBundler(op);
        TxHub.watchERC4337Op(network, opHash, op, { ...tx, readableInfo }).catch();

        return { success: true, txHash: opHash };
      } catch (error) {}
    }

    return { success: false, error: { message: 'Network error', code: -1 } };
  }
}
