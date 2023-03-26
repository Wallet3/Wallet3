import { BigNumber, utils } from 'ethers';

import { AccountBase } from './AccountBase';
import { AuthOptions } from '../auth/Authentication';
import { ReadableInfo } from '../../models/entities/Transaction';
import { SignTxRequest } from '../wallet/WalletBase';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getTransactionCount } from '../../common/RPC';
import { showMessage } from 'react-native-flash-message';

export class EOA extends AccountBase {
  readonly accountSubPath: string | undefined;
  readonly type = 'eoa';

  async getNonce(chainId: number) {
    return BigNumber.from(await getTransactionCount(chainId, this.address));
  }

  async signTx(args: SignTxRequest & AuthOptions) {
    try {
      const txHex = await (await this.wallet?.openWallet({ ...args, accountIndex: this.index }))?.signTransaction(args.tx);
      return { txHex };
    } catch (error: any) {
      return { error };
    }
  }

  async sendTx(args: { tx: TransactionRequest; readableInfo?: ReadableInfo }, pin?: string) {
    if (!this.wallet) return { success: false, error: { message: 'Account not available', code: -1 } };

    const { tx, readableInfo } = args;

    const { txHex, error } = await this.signTx({
      tx,
      pin,
      disableAutoPinRequest: true,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error.message, type: 'warning' });
      return { success: false, error: { message: 'Signing tx failed', code: -32602 } };
    }

    this.wallet.sendTx({
      tx,
      txHex,
      readableInfo,
    });

    const parsedTx = utils.parseTransaction(txHex);
    return { success: true, txHex, tx: parsedTx, txHash: parsedTx.hash };
  }
}
