import { BigNumber, BigNumberish, providers, utils } from 'ethers';

import App from '../core/App';
import { InpageDAppTxRequest } from '../../screens/browser/controller/InpageDAppController';
import MessageKeys from '../../common/MessageKeys';
import Networks from '../core/Networks';
import { SpeedupAbleSendParams } from '../transferring/RawTransactionRequest';
import Transaction from '../../models/entities/Transaction';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

export class TxController {
  private tx: Transaction;

  constructor(tx: Transaction) {
    this.tx = tx;
  }

  get network() {
    return Networks.find(this.tx.chainId || 1) || Networks.current;
  }

  speedUp(extra?: { data?: string; to?: string; title?: string; value: BigNumberish }) {
    const approve = async ({ pin, tx }: { pin?: string; tx: providers.TransactionRequest; readableInfo: any }) => {
      const { error } = await App.sendTxFromAccount(utils.getAddress(this.tx.from), {
        pin,
        tx,
        readableInfo: { ...(this.tx.readableInfo || {}), cancelTx: extra ? true : false },
      });

      if (error) {
        showMessage({ type: 'warning', message: error.message });
        return false;
      }

      return true;
    };

    const reject = () => {};

    PubSub.publish(MessageKeys.openInpageDAppSendTransaction, {
      approve,
      reject,
      param: {
        from: this.tx.from,
        to: extra?.to || this.tx.to,
        value: extra?.value ?? this.tx.value,
        data: extra?.data || this.tx.data,
        gas: `${this.tx.gas}`,
        nonce: `${this.tx.nonce}`,
        gasPrice: Number.parseInt((this.tx.gasPrice * 1.100001) as any).toString(),
        priorityPrice: Number.parseInt((this.tx.priorityPrice * 1.100001) as any).toString(),
        speedUp: true,
      } as SpeedupAbleSendParams,
      chainId: this.network.chainId,
      account: utils.getAddress(this.tx.from),
      app: {
        name: this.tx.readableInfo.dapp || extra?.title || `🚀 ${i18n.t('button-speed-up')}`,
        icon: this.tx.readableInfo.icon || '',
      },
    } as InpageDAppTxRequest);
  }

  cancel() {
    this.speedUp({ data: '0x', to: this.tx.from, title: `⛔️ ${i18n.t('button-cancel-tx')}`, value: BigNumber.from(0) });
  }
}
