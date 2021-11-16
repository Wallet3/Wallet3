import { WCCallRequestRequest, WCClientMeta, WCSessionRequestRequest } from '../models/WCSession_v1';
import { makeObservable, observable } from 'mobx';

import { EventEmitter } from '../utils/events';
import WalletConnectClient from '@walletconnect/client';

export class WalletConnect_v1 extends EventEmitter {
  private client!: WalletConnectClient;

  peerId = '';
  appMeta: WCClientMeta | null = null;

  constructor(uri?: string) {
    super();

    makeObservable(this, { appMeta: observable });
    if (uri) this.connect(uri);
  }

  connect(uri: string) {
    this.client = new WalletConnectClient({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A Secure Wallet for Web3 Era',
        icons: [],
        url: 'https://wallet3.io',
      },
    });

    this.client.on('session_request', this.handleSessionRequest);
    this.client.on('call_request', this.handleCallRequest);
    this.client.on('disconnect', () => this.emit('disconnect'));
    this.client.on('transport_error', () => this.emit('transport_error'));
    this.client.on('transport_open', () => this.emit('transport_open'));
  }

  private handleSessionRequest = async (error: Error | null, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    this.emit('sessionRequest');

    const [{ peerMeta, peerId }] = request.params;
    this.peerId = peerId;
    this.appMeta = peerMeta;
  };

  approveSession = async (accounts: string[], chainId: number) => {
    this.client.approveSession({ accounts, chainId });
    this.emit('sessionApproved', this.client.session);
  };

  rejectSession = () => {
    this.client.rejectSession({ message: 'User cancelled' });
  };

  private handleCallRequest = async (error: Error | null, request: WCCallRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    // const checkAccount = (from: string) => {
    //   if (from?.toLowerCase() === this.wallet.currentAddress.toLowerCase()) return true;
    //   this.connector.rejectRequest({ id: request.id, error: { message: 'Update session' } });
    //   this.updateSession();
    //   return false;
    // };

    console.log(request.method);
    console.log(request.params);

    switch (request.method) {
      case 'eth_sendTransaction':
      //     const [param, chainId] = request.params as [WCCallRequest_eth_sendTransaction, string];
      //     if (!checkAccount(param.from)) return;

      //     this.eth_sendTransaction(request, param, chainId ? Number.parseInt(chainId) : undefined);
      //     break;
      //   case 'eth_signTransaction':
      //     this.connector.rejectRequest({ id: request.id, error: { message: 'Use eth_sendTransaction' } });
      //     return;
      //   case 'eth_sign':
      //     if (!checkAccount(request.params[0])) return;
      //     this.sign(request, request.params, 'eth_sign');
      //     break;
      //   case 'personal_sign':
      //     if (!checkAccount(request.params[1])) return;
      //     this.sign(request, request.params, 'personal_sign');
      //     break;
      //   case 'eth_signTypedData':
      //     if (!checkAccount(request.params[0])) return;
      //     this.sign(request, request.params, 'signTypedData');
      //     break;
    }

    this.emit('sessionUpdated');
  };

  dispose() {
    // this._chainIdObserver?.();
    // this._currAddrObserver?.();
    // this.removeAllListeners();

    this.client?.off('session_request');
    this.client?.off('call_request');
    this.client?.off('disconnect');
    this.client?.off('transport_error');
    this.client?.off('transport_open');
    this.client?.transportClose();

    (this.client as any) = undefined;
    (this.approveSession as any) = undefined;
    (this.rejectSession as any) = undefined;
  }
}
