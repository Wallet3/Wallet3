import Networks, { AddEthereumChainParameter } from '../core/Networks';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { action, makeObservable, observable } from 'mobx';

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
  icons: [],
  url: 'https://wallet3.io',
};

function getNamespaces(accounts: string[], chains: number[]) {
  return {
    eip155: {
      chains: Networks.all.map((c) => `eip155:${c}`),
      accounts: accounts.flatMap((addr) => chains.map((c) => `eip155:${c}:${addr}`)),
      methods: [
        'eth_sign',
        'personalSign',
        'personal_sign',
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
      ],
      events: ['accountsChanged', 'chainChanged'],
      extensions: [],
    },
  };
}

export class WalletConnect_v2 extends EventEmitter {
  private client!: Web3WalletType;
  private sessionProposal?: Web3WalletTypes.SessionProposal;
  store?: WCV2_Session;

  readonly version = 1;
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

  constructor(uri?: string) {
    super();

    makeObservable(this, {
      appMeta: observable,
      setLastUsedAccount: action,
      setLastUsedChain: action,
    });

    if (uri) this.connect(uri);
  }

  async connect(uri: string) {
    const core = new Core({
      projectId: WalletConnect2ProjectID,
    });

    this.client = await Web3Wallet.init({ core, metadata: clientMeta });

    this.client.on('session_proposal', this.handleSessionProposal);
    this.client.on('session_request', this.handleSessionRequest);

    await this.client.core.pairing.pair({ uri, activatePairing: true });

    return this;
  }

  // connectSession(session: IRawWcSession) {
  //   this.client = new WalletConnectClient({ session, clientMeta });
  //   this.client.on('call_request', this.handleSessionRequest);
  //   this.client.on('disconnect', () => this.emit('disconnect'));
  //   this.appMeta = session.peerMeta;
  //   this.peerId = session.peerId;

  //   return this;
  // }

  private updateSession({ chainId, accounts }: { chainId?: number; accounts?: string[] }) {
    if (!this.session) return;

    this.client?.updateSession({
      topic: this.session.topic,
      namespaces: getNamespaces(accounts || [this.lastUsedAccount], [chainId ?? Number(this.lastUsedChainId)]),
    });
  }

  setLastUsedChain(chainId: number, persistent = false, from: 'user' | 'inpage' = 'user') {
    this.updateSession({ chainId });

    if (!this.store) return;

    this.store.lastUsedChainId = `${chainId}`;
    if (persistent) this.store.save();

    this.emit('lastUsedChainChanged', chainId, from);
  }

  setLastUsedAccount(account: string, persistent = false) {
    this.updateSession({ accounts: [account] });
    if (!this.store) return;

    this.store.lastUsedAccount = account;

    if (persistent) this.store.save();
  }

  setStore(store: WCV2_Session) {
    this.store = store;

    if (!store.lastUsedChainId) {
      this.setLastUsedChain(Networks.current.chainId);
    }

    if (!store.lastUsedAccount) {
      this.setLastUsedAccount(App.currentAccount!.address);
    }

    return this;
  }

  private handleSessionProposal = async (proposal: Web3WalletTypes.SessionProposal) => {
    this.sessionProposal = proposal;

    console.log('session proposal');
    console.log(proposal, proposal.params.requiredNamespaces);

    const [chain] = proposal.params.requiredNamespaces['eip155']?.chains;
    const chainId = chain.split?.(':')?.[1];

    this.appMeta = proposal.params.proposer.metadata;
    this.peerId = proposal.params.proposer.publicKey;

    if (this.store) {
      if (Number.isInteger(chainId)) this.store.lastUsedChainId = `${chainId}`;
      this.store.lastUsedTimestamp = Date.now();
    }

    this.emit('sessionRequest');
  };

  approveSession = async () => {
    const session = await this.client.approveSession({
      id: this.sessionProposal!.id,
      namespaces: getNamespaces([this.lastUsedAccount], [Number(this.lastUsedChainId)]),
    });

    session.controller;
    session.topic;
    console.log('approve', session);
    this.store!.session = session;
    this.store?.save();
    // this.emit('sessionApproved', this.client.session);
  };

  rejectSession = () => {
    if (!this.sessionProposal) return;
    this.client.rejectSession({ id: this.sessionProposal?.id, reason: getSdkError('USER_REJECTED_METHODS') });
  };

  // rejectRequest = (id: number, message: string) => {
  //   this.client.respondSessionRequest({ topic, response });
  //   this.client.rejectRequest({ id, error: { message } });
  // };

  // approveRequest = (id: number, result: any) => {
  //   this.client.approveRequest({ id, result });
  // };

  responseRequest = (topic: string, response: { id: number; error?: { code: number; message: string }; result?: any }) => {
    this.client.respondSessionRequest({ topic, response: response as any });
  };

  private handleSessionRequest = async (sessionRequest: Web3WalletTypes.SessionRequest) => {
    const { id, params, topic } = sessionRequest;
    const { chainId, request } = params;

    console.log(sessionRequest);

    if (this.activeAccount?.address !== this.lastUsedAccount || !this.lastUsedAccount) {
      this.responseRequest(topic, { error: { message: 'Not authorized', code: 4001 }, id });
      showMessage({ message: i18n.t('msg-account-not-found'), type: 'warning' });
      return;
    }

    switch (request.method) {
      case 'wallet_addEthereumChain':
        const [addChainParams] = (request.params as AddEthereumChainParameter[]) || [];

        if (!addChainParams) {
          this.responseRequest(topic, { id, error: { code: 4001, message: 'Invalid parameters' } });
          return;
        }

        if (Networks.has(addChainParams.chainId)) {
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.responseRequest(topic, { id, result: null });
          return;
        }

        const approve = async () => {
          PubSub.publish(MessageKeys.openLoadingModal);

          if ((await Networks.add(addChainParams)) === false) {
            this.responseRequest(topic, { error: { code: 4001, message: 'Client error occurs' }, id });
            return;
          }

          showMessage({ message: i18n.t('msg-chain-added', { name: addChainParams.chainName }), type: 'success' });
          this.setLastUsedChain(Number(addChainParams.chainId), true, 'inpage');
          this.responseRequest(topic, { id, result: null });
        };

        const reject = () => this.responseRequest(topic, { id, error: { code: 4001, message: 'User rejected' } });

        PubSub.publish(MessageKeys.openAddEthereumChain, {
          approve,
          reject,
          chain: addChainParams,
        } as InpageDAppAddEthereumChain);
        return;
      case 'wallet_switchEthereumChain':
        const [switchChainParams] = (request.params as { chainId: string }[]) || [];
        if (!Networks.has(switchChainParams.chainId)) {
          this.responseRequest(topic, { id, error: { code: 4001, message: 'Chain not supported' } });
          return;
        }

        this.setLastUsedChain(Number(switchChainParams.chainId), true, 'inpage');
        this.responseRequest(topic, { id, result: null });
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
      this.responseRequest(topic, { id, error: { message: 'Method not supported', code: 4001 } });
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
