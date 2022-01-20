import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction } from '../../models/WCSession_v1';

import App from '../App';
import Networks from '../Networks';
import { RawTransactionRequest } from './RawTransactionRequest';
import { WalletConnect_v1 } from '../walletconnect/WalletConnect_v1';

interface IConstructor {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
}

type RequestType = 'Transfer' | 'Contract Interaction' | 'Approve' | 'Unknown';

const Transfer = '0xa9059cbb';
const Approve = '0x095ea7b3';
const Methods = new Map<string, RequestType>([
  [Transfer, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve, 'Approve'],
]);

export function parseRequestType(data: string): { type: RequestType; methodFunc: string } {
  if (typeof data !== 'string') return { type: 'Unknown', methodFunc: '' };
  const methodFunc = data.slice(0, 10);
  return { type: data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer', methodFunc };
}

export class TransactionRequest extends RawTransactionRequest {
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
}
