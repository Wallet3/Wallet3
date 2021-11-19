import { BigNumber, constants, ethers, utils } from 'ethers';
import { INetwork, PublicNetworks } from '../common/Networks';
import { WCCallRequestRequest, WCCallRequest_eth_sendTransaction, WCClientMeta } from '../models/WCSession_v1';
import { computed, makeObservable, observable, runInAction } from 'mobx';

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

const Transfer = '0xa9059cbb';
const Approve = '0x095ea7b3';
const Methods = new Map<string, RequestType>([
  [Transfer, 'Transfer'],
  ['0x', 'Transfer'],
  [Approve, 'Approve'],
]);

export class TransactionRequest extends BaseTransaction {
  private client: WalletConnect_v1;
  private param: WCCallRequest_eth_sendTransaction;

  type!: RequestType;
  to!: string;
  valueWei = BigNumber.from(0);
  tokenAmountWei = BigNumber.from(0);
  tokenDecimals = 18;
  tokenSymbol = '';

  get tokenAmount() {
    try {
      return Number(utils.formatUnits(this.tokenAmountWei, this.tokenDecimals)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      return '0';
    }
  }

  get maxUint256Amount() {
    return this.tokenAmountWei.eq(constants.MaxUint256);
  }

  get value() {
    try {
      return Number(utils.formatUnits(this.valueWei, 18)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      });
    } catch (error) {
      return '0';
    }
  }

  constructor({ request, client }: IConstructor) {
    console.log('new transactionRequest');
    const [param, requestChainId] = request.params as [WCCallRequest_eth_sendTransaction, number?];
    const account = App.currentWallet!.currentAccount!.address;

    const network =
      PublicNetworks.find((n) => n.chainId === requestChainId) ??
      (client.enabledChains.includes(Networks.current.chainId)
        ? Networks.current
        : PublicNetworks.find((n) => client.enabledChains[0] === n.chainId)) ??
      PublicNetworks[0];

    console.log(
      requestChainId,
      Networks.current.chainId,
      client.enabledChains.includes(Networks.current.chainId),
      network.network,
      client.enabledChains
    );

    super({ network, account });

    this.client = client;
    this.param = param;

    makeObservable(this, {
      valueWei: observable,
      value: computed,
      tokenAmountWei: observable,
      tokenAmount: computed,
      tokenDecimals: observable,
      tokenSymbol: observable,
    });

    runInAction(() => this.parseRequest(param, account));
  }

  get appMeta(): WCClientMeta {
    return this.client.appMeta!;
  }

  get feeTokenSymbol() {
    return this.network.symbol;
  }

  async parseRequest(param: WCCallRequest_eth_sendTransaction, account: string) {
    const methodFunc = param.data.slice(0, 10);

    this.type = param.data ? Methods.get(methodFunc) ?? 'Contract Interaction' : 'Transfer';
    const erc20 = new ERC20Token({ chainId: this.network.chainId, contract: param.to, owner: account });

    switch (methodFunc) {
      case Transfer:
        const [to, transferAmount] = erc20.interface.decodeFunctionData('transfer', param.data) as [string, BigNumber];
        console.log('transfer');
        this.to = to;
        this.tokenAmountWei = transferAmount;

        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        break;
      case Approve:
        const [spender, approveAmount] = erc20.interface.decodeFunctionData('approve', param.data) as [string, BigNumber];
        console.log('approve');

        this.to = spender;
        this.tokenAmountWei = approveAmount;

        erc20.getDecimals().then((decimals) => runInAction(() => (this.tokenDecimals = decimals)));
        erc20.getSymbol().then((symbol) => runInAction(() => (this.tokenSymbol = symbol)));
        break;

      default:
        this.to = param.to;
        this.valueWei = BigNumber.from(param.value || 0);
        break;
    }

    if (param.gas) {
      runInAction(() => this.setGasLimit(param.gas));
    } else {
      this.estimateGas({ from: account, to: param.to, data: param.data, value: param.value });
    }
  }
}
