import { AccountBase } from './AccountBase';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { showMessage } from 'react-native-flash-message';
import { utils } from 'ethers';

export class EOA extends AccountBase {
  readonly type = 'eoa';

  async sendTx(args: { tx: TransactionRequest; readableInfo?: any }, pin?: string) {
    const { tx, readableInfo } = args;

    const { txHex, error } = await this.wallet!.signTx({
      accountIndex: this.index,
      tx,
      pin,
      disableAutoPinRequest: true,
    });

    if (!txHex || error) {
      if (error) showMessage({ message: error, type: 'warning' });
      return { success: false, error: { message: 'Signing tx failed', code: -32602 } };
    }

    this.wallet!.sendTx({
      tx,
      txHex,
      readableInfo,
    });

    const parsedTx = utils.parseTransaction(txHex);
    return { success: true, txHex, tx: parsedTx, txHash: parsedTx.hash };
  }
}
