import { providers, utils } from 'ethers';

import { InpageDAppTxRequest } from '../hubs/InpageMetamaskDAppHub';
import Networks from '../Networks';
import { SpeedupAbleSendParams } from '../transferring/RawTransactionRequest';
import Transaction from '../../models/Transaction';
import { WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';

export class TxController {
  private tx: Transaction;

  constructor(tx: Transaction) {
    this.tx = tx;
  }

  get network() {
    return Networks.find(this.tx.chainId || 1) || Networks.current;
  }

  speedUp(extra?: { data?: string; to?: string; title?: string }) {
    const approve = ({ pin, tx, readableInfo }: { pin?: string; tx: providers.TransactionRequest; readableInfo: any }) => {};

    const reject = () => {};

    console.log(this.tx);

    PubSub.publish('openInpageDAppSendTransaction', {
      approve,
      reject,
      param: {
        from: this.tx.from,
        to: extra?.to || this.tx.to,
        value: this.tx.value,
        data: extra?.data || this.tx.data,
        gas: `${this.tx.gas}`,
        nonce: `${this.tx.nonce}`,
        gasPrice: Number.parseInt((this.tx.gasPrice * 1.101) as any).toString(),
        priorityPrice: Number.parseInt((this.tx.priorityPrice * 1.101) as any).toString(),
        speedUp: true,
      } as SpeedupAbleSendParams,
      chainId: this.network.chainId,
      account: utils.getAddress(this.tx.from),
      app: { name: this.tx.readableInfo.dapp || extra?.title || '🚀 Speed Up', icon: this.tx.readableInfo.icon || '' },
    } as InpageDAppTxRequest);
  }

  cancel() {
    this.speedUp({ data: '0x', to: this.tx.from, title: 'Cancel Tx' });
  }
}
