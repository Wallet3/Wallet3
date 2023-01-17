import Networks, { AddEthereumChainParameter } from '../core/Networks';
import WCV2_Session, { SessionStruct } from '../../models/entities/WCSession_v2';
import { action, makeObservable, observable, runInAction } from 'mobx';

import App from '../core/App';
import { ErrorResponse } from '@walletconnect/jsonrpc-types';
import { EventEmitter } from 'events';
import { InpageDAppAddEthereumChain } from '../../screens/browser/controller/InpageDAppController';
import MessageKeys from '../../common/MessageKeys';
import { WCClientMeta } from '../../models/entities/WCSession_v1';
import { Web3Wallet as Web3WalletType } from '@walletconnect/web3wallet/dist/types/client';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import { getSdkError } from '@walletconnect/utils';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

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

function getNamespaces(accounts: string[], eipChains: string[]) {
  return {
    eip155: {
      chains: Networks._all.map((c) => `eip155:${c}`),
      accounts: accounts.flatMap((addr) => eipChains.map((c) => `${c}:${addr}`)),
      methods: SupportedMethods,
      events: SupportedEvents,
      extensions: [],
    },
  };
}

export class WalletConnect_v2 extends EventEmitter {
  readonly version = 2;

  private readonly client: Web3WalletType;
  private _appMeta!: WCClientMeta;
  private sessionProposal?: Web3WalletTypes.SessionProposal;

  store: WCV2_Session;

  peerId = '';
  get appMeta() {
    return this.session?.peer?.metadata || this._appMeta;
  }

  get uniqueId() {
    return this.session!.topic;
  }

  get session(): SessionStruct | undefined {
    return this.store.session;
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

  constructor(client: Web3WalletType, store = new WCV2_Session()) {
    super();

    this.client = client;
    this.store = store;

    makeObservable(this, {
      setLastUsedAccount: action,
      setLastUsedChain: action,
    });
  }

  private updateSession({ chains, accounts }: { chains?: string[]; accounts?: string[] }) {
    if (!this.session) return;

    this.client
      ?.updateSession({
        topic: this.session?.topic,
        namespaces: getNamespaces(
          accounts || [this.lastUsedAccount],
          chains || this.session.requiredNamespaces['eip155'].chains
        ),
      })
      .catch(() => {});
  }

  setLastUsedChain(chainId: number, persistent = false, from: 'user' | 'inpage' = 'user') {
    if (!chainId) return;
    if (Number(this.store.lastUsedChainId) === chainId) return;

    const { chains } = (this.session?.requiredNamespaces?.['eip155'] || {}) as { chains: string[] };

    if (!chains) return;
    if (!chains?.find((c) => Number(c.split(':')[1]) === chainId)) {
      showMessage({
        type: 'info',
        message: i18n.t('msg-the-app-does-not-support-chain', { network: Networks.find(chainId)?.network }),
      });

      return;
    }

    this.store.lastUsedChainId = `${chainId}`;
    this.store.lastUsedTimestamp = Date.now();
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

    const eip155 = proposal?.params?.requiredNamespaces?.['eip155'];
    if (!eip155?.chains?.length) {
      this.rejectSession(getSdkError('INVALID_SESSION_SETTLE_REQUEST'));
      showMessage({ type: 'info', message: i18n.t('msg-currently-ethereum-and-evm-networks-support') });
      return false;
    }

    const { chains, methods } = eip155;
    const notSupportedChain = chains.find((c) => !Networks.find(c?.split(':')?.[1]));
    if (notSupportedChain) {
      this.rejectSession(getSdkError('UNSUPPORTED_CHAINS'));
      PubSub.publish(MessageKeys.walletconnect.notSupportedSessionProposal, this);
      this.emit(MessageKeys.walletconnect.notSupportedSessionProposal);
      showMessage({ type: 'info', message: i18n.t('msg-the-app-does-not-support-chain', { network: notSupportedChain }) });
      return false;
    }

    if (methods.some((m) => !SupportedMethods.includes(m))) {
      PubSub.publish(MessageKeys.walletconnect.notSupportedSessionProposal, this);
      this.emit(MessageKeys.walletconnect.notSupportedSessionProposal);
      this.rejectSession(getSdkError('UNSUPPORTED_METHODS'));
      return false;
    }

    const [chain] = chains;
    const chainId = Number(chain.split?.(':')?.[1]);
    if (!chainId) {
      PubSub.publish(MessageKeys.walletconnect.notSupportedSessionProposal, this);
      this.emit(MessageKeys.walletconnect.notSupportedSessionProposal);
      this.rejectSession(getSdkError('UNSUPPORTED_CHAINS'));
      return false;
    }

    this.peerId = proposal.params.proposer.publicKey;

    this.store.lastUsedChainId = `${chainId}`;
    this.store.lastUsedAccount = App.currentAccount!.address;
    this.store.lastUsedTimestamp = Date.now();

    runInAction(() => (this._appMeta = proposal.params.proposer.metadata));

    this.emit('sessionRequest');
    return true;
  };

  approveSession = async () => {
    const { chains } = this.sessionProposal!.params.requiredNamespaces['eip155'];

    const session = await this.client.approveSession({
      id: this.sessionProposal!.id,
      namespaces: getNamespaces([this.lastUsedAccount], chains),
    });

    this.store.session = session;
    this.store.topic = session.topic;
    this.store.save();

    this.emit('sessionApproved', this);
  };

  rejectSession = (reason?: ErrorResponse) => {
    if (!this.sessionProposal) return;

    this.client.rejectSession({
      id: this.sessionProposal?.id,
      reason: reason ?? getSdkError('USER_REJECTED_METHODS'),
    });
  };

  rejectRequest = (id: number, message: string) => {
    if (!this.session) return;
    this.responseRequest(this.session.topic, { id, error: { message, code: 4001 }, jsonrpc: '2.0' });
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

    this.setLastUsedChain(Number(chainId.split(':')[1]), true);
    PubSub.publish(MessageKeys.wc_request, { client: this, request });

    this.emit('sessionUpdated');
  };

  dispose() {
    this.removeAllListeners();

    (this.client as any) = undefined;
    (this.approveSession as any) = undefined;
    (this.rejectSession as any) = undefined;
  }

  async killSession() {
    if (!this.session) return;

    this.emit('disconnect', this);

    try {
      this.store.remove().catch();
      if (this.client?.getActiveSessions?.()?.[this.session.topic]) {
        this.client.disconnectSession({ topic: this.session.topic, reason: getSdkError('USER_DISCONNECTED') }).catch(() => {});
      }
    } catch (e) {
    } finally {
      this.dispose();
    }
  }
}
