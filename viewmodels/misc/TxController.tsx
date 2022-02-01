import { BigNumber, BigNumberish, providers, utils } from 'ethers';

import App from '../App';
import { InpageDAppTxRequest } from '../hubs/InpageMetamaskDAppHub';
import Networks from '../Networks';
import { SpeedupAbleSendParams } from '../transferring/RawTransactionRequest';
import Transaction from '../../models/Transaction';
import { WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';
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
      const { wallet, accountIndex } = App.findWallet(utils.getAddress(this.tx.from)) || {};
      if (!wallet) {
        showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
        return false;
      }

      const { txHex, error } = await wallet.signTx({
        tx,
        pin,
        accountIndex: accountIndex!,
      });

      if (!txHex || error) {
        if (error) showMessage({ type: 'warning', message: error?.message || error });
        return false;
      }

      const broadcastTx = {
        txHex,
        tx,
        readableInfo: { ...(this.tx.readableInfo || {}), cancelTx: extra ? true : false },
      };

      wallet.sendTx(broadcastTx);

      return true;
    };

    const reject = () => {};

    PubSub.publish('openInpageDAppSendTransaction', {
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
