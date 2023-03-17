import { AccountBase, SendTxRequest } from './AccountBase';
import { BigNumber, ethers, utils } from 'ethers';
import { HttpRpcClient, SimpleAccountAPI } from '@account-abstraction/sdk';
import { getCode, getRPCUrls } from '../../common/RPC';
import { makeObservable, observable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import TxHub from '../hubs/TxHub';
import { WalletBase } from '../wallet/WalletBase';
import { userOpsToJSON } from '../../models/entities/ERC4337Transaction';

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

  async checkActivated(chainId: number) {
    if (this.activatedChains.get(chainId)) return true;

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

  async sendTx(args: SendTxRequest, pin?: string) {
    if (!this.wallet) return { success: false, error: { message: 'Account not available', code: -1 } };

    const { tx, txs, network, gas } = args;
    if (!network?.erc4337) return { success: false, error: { message: 'ERC4337 not supported', code: -1 } };

    const owner = await this.wallet.openWallet({
      accountIndex: this.index,
      subPath: this.wallet.ERC4337SubPath,
      disableAutoPinRequest: true,
      pin,
    });

    if (tx) {
      const target = utils.getAddress(tx.to!);
      const value = tx.value || BigNumber.from(0);

      if (!owner) return { success: false };

      const { bundlerUrls, entryPointAddress, factoryAddress } = network.erc4337;

      for (let url of getRPCUrls(network.chainId)) {
        const provider = new ethers.providers.JsonRpcProvider(url);
        const client = new SimpleAccountAPI({
          provider,
          owner,
          entryPointAddress,
          factoryAddress,
        });

        const op = await client.createSignedUserOp({
          target,
          value,
          data: (tx.data as string) || '0x',
          ...gas,
        });

        for (let bundlerUrl of bundlerUrls) {
          const http = new HttpRpcClient(bundlerUrl, entryPointAddress, network.chainId);
          const opHash = await http.sendUserOpToBundler(op);
          TxHub.watchERC4337Op(network, opHash, await Promise.all([op].map(userOpsToJSON))).catch();

          return { success: true, txHash: opHash };
        }

        break;
      }
    }

    return { success: false, error: { message: 'Network error', code: -1 } };
  }
}
