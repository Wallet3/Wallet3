import Networks, { AddEthereumChainParameter } from '../core/Networks';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { action, makeObservable, observable, runInAction } from 'mobx';

import App from '../core/App';
import { Core } from '@walletconnect/core';
import { EventEmitter } from 'events';
import { InpageDAppAddEthereumChain } from '../../screens/browser/controller/InpageDAppController';
import MessageKeys from '../../common/MessageKeys';
import { WCClientMeta } from '../../models/entities/WCSession_v1';
import WCV2_Session from '../../models/entities/WCSession_v2';
import { WalletConnect2ProjectID } from '../../configs/secret';
import { Web3Wallet as Web3WalletType } from '@walletconnect/web3wallet/dist/types/client';
import { getSdkError } from '@walletconnect/utils';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

const clientMeta = {
  name: 'Wallet 3',
  description: 'A Secure Wallet for Web3',
  icons: ['https://github.com/Wallet3/Wallet3/blob/main/assets/icon@128.rounded.png?raw=true'],
  url: 'https://wallet3.io',
};

const SupportedEvents = ['accountsChanged', 'chainChanged'];

const SupportedMethods = [
  'eth_sign',
  'personalSign',
  'personal_sign',
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v4',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
];

function getNamespaces(accounts: string[], chains: number[]) {
  return {
    eip155: {
      chains: Networks.all.map((c) => `eip155:${c}`),
      accounts: accounts.flatMap((addr) => chains.map((c) => `eip155:${c}:${addr}`)),
      methods: SupportedMethods,
      events: SupportedEvents,
      extensions: [],
    },
  };
}

export class WalletConnect_v2 extends EventEmitter {
  readonly pairingTopic: string;
  readonly version = 2;

  private readonly client: Web3WalletType;
  private sessionProposal?: Web3WalletTypes.SessionProposal;

  readonly store = new WCV2_Session();

  peerId = '';
  appMeta: WCClientMeta | null = null;

  get session() {
    return this.store?.session;
  }

  get lastUsedTimestamp() {
    return this.store?.lastUsedTimestamp ?? 0;
  }

  get isMobileApp() {
    return this.store?.isMobile ?? false;
  }

  get origin() {
    return this.store?.hostname ?? '';
  }

  get lastUsedChainId() {
    return this.store?.lastUsedChainId ?? '0x1';
  }

  get chains() {
    return [Number(this.lastUsedChainId)];
  }

  get lastUsedAccount() {
    return this.store?.lastUsedAccount ?? '';
  }

  get accounts() {
    return this.lastUsedAccount ? [this.lastUsedAccount] : [];
  }

  get activeAccount() {
    return App.findAccount(this.lastUsedAccount);
  }

  get activeNetwork() {
    return Networks.find(this.lastUsedChainId) || Networks.current;
  }

  constructor(client: Web3WalletType, pairingTopic: string) {
    super();

    this.client = client;
    this.pairingTopic = pairingTopic;

    makeObservable(this, {
      appMeta: observable,
      setLastUsedAccount: action,
      setLastUsedChain: action,
    });
  }

  private updateSession({ chainId, accounts }: { chainId?: number; accounts?: string[] }) {
    if (!this.session) return;

    this.client?.updateSession({
      topic: this.session.topic,
      namespaces: getNamespaces(accounts || [this.lastUsedAccount], [chainId ?? Number(this.lastUsedChainId)]),
    });
  }

  setLastUsedChain(chainId: number, persistent = false, from: 'user' | 'inpage' = 'user') {
    this.updateSession({ chainId });

    this.store.lastUsedChainId = `${chainId}`;
    if (persistent) this.store.save();

    this.emit('lastUsedChainChanged', chainId, from);
  }

  setLastUsedAccount(account: string, persistent = false) {
    this.updateSession({ accounts: [account] });
    this.store.lastUsedAccount = account;

    if (persistent) this.store.save();
  }

  handleSessionProposal = async (proposal: Web3WalletTypes.SessionProposal) => {
    this.sessionProposal = proposal;
    proposal.params.pairingTopic;

    console.log('session proposal');
    console.log(proposal, proposal.params.requiredNamespaces);

    const { chains, methods } = proposal.params.requiredNamespaces['eip155'] || {};
    const [chain] = proposal.params.requiredNamespaces['eip155']?.chains;
    const chainId = Number(chain.split?.(':')?.[1]);

    this.peerId = proposal.params.proposer.publicKey;

    this.store.lastUsedChainId = `${chainId}`;
    this.store.lastUsedAccount = App.currentAccount!.address;
    this.store.lastUsedTimestamp = Date.now();

    runInAction(() => (this.appMeta = proposal.params.proposer.metadata));

    this.emit('sessionRequest');
  };

  approveSession = async () => {
    const session = await this.client.approveSession({
      id: this.sessionProposal!.id,
      namespaces: getNamespaces([this.lastUsedAccount], [Number(this.lastUsedChainId)]),
    });

    session.controller;
    session.topic;
    console.log('approve', session.topic);

    this.store.session = session;
    this.store.topic = session.topic;
    this.store.save();

    this.emit('sessionApproved', this);
  };

  rejectSession = () => {
    if (!this.sessionProposal) return;
    this.client.rejectSession({ id: this.sessionProposal?.id, reason: getSdkError('USER_REJECTED_METHODS') });
  };

  rejectRequest = (id: number, message: string) => {
    if (!this.session) return;
    this.responseRequest(this.session?.topic, { id, error: { message, code: 4001 }, jsonrpc: '2.0' });
  };

  approveRequest = (id: number, result: any) => {
    if (!this.session) return;
    this.responseRequest(this.session.topic, { id, result, jsonrpc: '2.0' });
  };

  responseRequest = (
    topic: string,
    response: { id: number; error?: { code: number; message: string }; result?: any; jsonrpc: '2.0' }
  ) => {
    this.client.respondSessionRequest({ topic, response: response as any, id: response.id } as any);
  };

  handleSessionRequest = async (sessionRequest: Web3WalletTypes.SessionRequest) => {
    const { id, params, topic } = sessionRequest;
    const { chainId, request } = params;

    request['id'] = id;

    console.log('v2 request', topic, request);

    if (this.activeAccount?.address !== this.lastUsedAccount || !this.lastUsedAccount) {
      this.rejectRequest(id, 'Not authorized');
      showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
      return;
    }

    switch (request.method) {
      case 'wallet_addEthereumChain':
        const [addChainParams] = (request.params as AddEthereumChainParameter[]) || [];

        if (!addChainParams) {
          this.rejectRequest(id, 'Invalid parameters');
          return;
        }

        if (Networks.has(addChainParams.chainId)) {
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.approveRequest(id, null);
          return;
        }

        const approve = async () => {
          PubSub.publish(MessageKeys.openLoadingModal);

          if ((await Networks.add(addChainParams)) === false) {
            this.rejectRequest(id, 'Client error occurs');
            return;
          }

          showMessage({ message: i18n.t('msg-chain-added', { name: addChainParams.chainName }), type: 'success' });
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.approveRequest(id, null);
        };

        const reject = () => this.rejectRequest(id, 'User Rejected');

        PubSub.publish(MessageKeys.openAddEthereumChain, {
          approve,
          reject,
          chain: addChainParams,
        } as InpageDAppAddEthereumChain);
        return;
      case 'wallet_switchEthereumChain':
        const [switchChainParams] = (request.params as { chainId: string }[]) || [];
        if (!Networks.has(switchChainParams.chainId)) {
          this.rejectRequest(id, 'Chain not supported');
          return;
        }

        this.setLastUsedChain(Number(switchChainParams.chainId), true, 'inpage');
        this.approveRequest(id, null);
        return;
    }

    if (
      ![
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
      ].some((method) => request.method === method)
    ) {
      this.rejectRequest(id, 'Method not supported');
      return;
    }

    PubSub.publish(MessageKeys.wc_request, { client: this, request });

    this.emit('sessionUpdated');
  };

  dispose() {
    this.removeAllListeners();

    (this.client as any) = undefined;
    (this.approveSession as any) = undefined;
    (this.rejectSession as any) = undefined;
  }

  killSession() {
    if (!this.session) return;
    return this.client?.disconnectSession({ topic: this.session!.topic, reason: getSdkError('USER_DISCONNECTED') });
  }
}
