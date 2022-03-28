import { Methods, RequestType } from './RequestTypes';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';

import { RawTransactionRequest } from './RawTransactionRequest';
import { WalletConnect_v1 } from '../walletconnect/WalletConnect_v1';

interface IConstructor {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
}

export function parseRequestType(data: string): { type: RequestType; methodFunc: string } {
  if (typeof data !== 'string') return { type: 'Unknown', methodFunc: '' };
  const methodFunc = data.slice(0, 10);
  return { type: data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer', methodFunc };
}

export class WalletConnectTransactionRequest extends RawTransactionRequest {
  private client: WalletConnect_v1;

  constructor({ request, client }: IConstructor) {
    const [param, requestChainId] = request.params as [WCCallRequest_eth_sendTransaction, number?];

    if (requestChainId) {
      client.setLastUsedChain(requestChainId, true);
    }

    const account = client.activeAccount!;
    const network = client.activeNetwork;

    super({ network, account, param });

    this.client = client;
  }

  get appMeta() {
    const { description, icons, name, url } = this.client.appMeta!;
    return { desc: description, icon: icons[0], name, url };
  }

  sendTx(pin?: string) {
    return super.sendRawTx(
      {
        tx: this.txRequest,
        readableInfo: {
          type: 'dapp-interaction',
          dapp: this.appMeta.name,
          icon: this.appMeta.icon,
          decodedFunc: this.decodedFunc?.fullFunc,
        },
      },
      pin
    );
  }
}
