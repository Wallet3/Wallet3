import { INetwork, PublicNetworks } from '../common/Networks';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction, WCClientMeta } from '../models/WCSession_v1';

import App from './App';
import { BaseTransaction } from './BaseTransaction';
import Networks from './Networks';
import { WalletConnect_v1 } from './WalletConnect_v1';

interface IConstructor {
  client: WalletConnect_v1;
  request: WCCallRequestRequest;
}

export class TransactionRequest extends BaseTransaction {
  private client: WalletConnect_v1;

  constructor({ request, client }: IConstructor) {
    console.log('new transactionRequest');
    const network =
      PublicNetworks.find((n) => n.chainId === requestChainId) ??
      (client.enabledChains.includes(Networks.current.chainId)
        ? Networks.current
        : PublicNetworks.find((n) => client.enabledChains[0] === n.chainId)) ??
      PublicNetworks[0];

    const [param, requestChainId] = request.params as [WCCallRequest_eth_sendTransaction, number?];

    super({ network, account: App.currentWallet!.currentAccount!.address });

    this.client = client;
  }

  get appMeta(): WCClientMeta {
    return this.client.appMeta!;
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }
}
