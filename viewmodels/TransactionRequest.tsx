import { INetwork, PublicNetworks } from '../common/Networks';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction, WCClientMeta } from '../models/WCSession_v1';

import App from './App';
import { BaseTransaction } from './BaseTransaction';
import { ERC20Token } from '../models/ERC20';
import Networks from './Networks';
import { WalletConnect_v1 } from './WalletConnect_v1';

interface IConstructor {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
}

type RequestType = 'Transfer' | 'Contract Interaction' | 'Approve';

const Methods = new Map<string, RequestType>([
  ['0xa9059cbb', 'Transfer'],
  ['0x', 'Transfer'],
  ['0x095ea7b3', 'Approve'],
]);

export class TransactionRequest extends BaseTransaction {
  private client: WalletConnect_v1;

  readonly type: RequestType;
  to!: string;
  amount?: string;

  constructor({ request, client }: IConstructor) {
    console.log('new transactionRequest');
    const network =
      PublicNetworks.find((n) => n.chainId === requestChainId) ??
      (client.enabledChains.includes(Networks.current.chainId)
        ? Networks.current
        : PublicNetworks.find((n) => client.enabledChains[0] === n.chainId)) ??
      PublicNetworks[0];

    const [param, requestChainId] = request.params as [WCCallRequest_eth_sendTransaction, number?];

    const account = App.currentWallet!.currentAccount!.address;
    super({ network, account });

    const methodFunc = param.data.slice(0, 10);

    this.client = client;
    this.type = param.data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer';

    this.parseRequest(param, account);
  }

  get appMeta(): WCClientMeta {
    return this.client.appMeta!;
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }

  parseRequest(param: WCCallRequest_eth_sendTransaction, account: string) {
    const methodFunc = param.data.slice(0, 10);

    if (methodFunc === '0xa9059cbb') {
      try {
        const [to, amount] = new ERC20Token({ chainId: 0, contract: param.to, owner: account }).interface.decodeFunctionData(
          'transfer',
          param.data
        );
        this.to = to;
      } catch (error) {}
    } else {
      this.to = param.to;
    }
  }
}
