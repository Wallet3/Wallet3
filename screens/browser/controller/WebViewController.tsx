import * as Linking from 'expo-linking';

import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { Account } from '../../../viewmodels/account/Account';
import App from '../../../viewmodels/App';
import GetPageMetadata from '../scripts/Metadata';
import { INetwork } from '../../../common/Networks';
import { InpageMetamaskDAppHub } from '../../../viewmodels/hubs/InpageMetamaskDAppHub';
import { JS_POST_MESSAGE_TO_PROVIDER } from '../scripts/Utils';
import LinkHub from '../../../viewmodels/hubs/LinkHub';
import Networks from '../../../viewmodels/Networks';
import WalletConnectV1ClientHub from '../../../viewmodels/walletconnect/WalletConnectV1ClientHub';

interface PageMetadata {
  icon: string;
  title: string;
  desc?: string;
  origin: string;
}

interface ConnectedBrowserDApp {
  origin: string;
  lastUsedChainId: string;
  lastUsedAccount: string;
  isWalletConnect?: boolean;
}

class WebViewController {
  readonly hub = new InpageMetamaskDAppHub();
  webView: WebView | null;

  pageMetadata: PageMetadata | null = null;
  dapp: ConnectedBrowserDApp | null = null;
  appNetwork: INetwork | null = null;
  appAccount: Account | null = null;

  canGoBack = false;
  canGoForward = false;
  webUrl = '';

  constructor(webView: WebView) {
    this.webView = webView;

    makeAutoObservable(this);

    reaction(
      () => this.dapp,
      () => this.forceUpdateStates()
    );

    reaction(
      () => this.webUrl,
      () => this.updateGlobalState()
    );

    this.hub.on('appChainUpdated_metamask', this.notifyWebView);
    this.hub.on('appAccountUpdated_metamask', this.notifyWebView);

    this.hub.on('dappConnected', (app) => runInAction(() => (this.dapp = app)));

    WalletConnectV1ClientHub.on('mobileAppConnected', this.updateGlobalState);
  }

  dispose() {
    this.hub.removeAllListeners();
    WalletConnectV1ClientHub.off('mobileAppConnected', this.updateGlobalState);
    this.webView = null;
  }

  private forceUpdateStates() {
    this.appNetwork = Networks.find(this.dapp?.lastUsedChainId ?? -1) || null;
    this.appAccount = App.findAccount(this.dapp?.lastUsedAccount ?? '') || null;
  }

  private updateGlobalState() {
    if (!this.pageMetadata) this.webView?.injectJavaScript(`${GetPageMetadata}\ntrue;`);

    const hostname = (Linking.parse(this.webUrl || 'http://').hostname ?? this.dapp?.origin) || '';
    if (this.dapp?.origin === hostname) return;

    const wcApp = WalletConnectV1ClientHub.find(hostname);

    if (wcApp && wcApp.isMobileApp) {
      this.dapp = {
        lastUsedChainId: wcApp.lastUsedChainId,
        lastUsedAccount: wcApp.lastUsedAccount,
        origin: wcApp.origin,
        isWalletConnect: true,
      };

      wcApp.once('disconnect', () => {
        // console.log(dapp?.origin, wcApp.origin);
        // if (!dapp?.isWalletConnect) return;
        // if (dapp.origin !== origin) return;

        this.dapp = null;
      });

      return;
    }

    this.hub.getDApp(hostname).then((app) => (this.dapp = app || null));
  }

  onNavigationStateChange(event: WebViewNavigation) {
    this.canGoBack = event.canGoBack;
    this.canGoForward = event.canGoForward;
    this.webUrl = event.url;
  }

  notifyWebView = async (appState) => {
    this.webView?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(appState));
    const dapp = (await this.hub.getDApp(appState.origin)) || null;

    runInAction(() => {
      this.dapp = dapp;
      this.forceUpdateStates();
    });
  };

  onMessage = async (e: WebViewMessageEvent) => {
    let data: { type: string; payload: any; origin?: string; pageMetadata?: PageMetadata; name?: string; data: any };

    try {
      data = JSON.parse(e.nativeEvent.data);
    } catch (error) {
      return;
    }

    switch (data.type ?? data.name) {
      case 'metadata':
        this.pageMetadata = data.payload;
        break;
      case 'wcuri':
        LinkHub.handleURL(data.payload.uri, {
          fromMobile: true,
          hostname: Linking.parse(this.pageMetadata?.origin ?? 'https://').hostname ?? '',
        });
        break;
      case 'metamask-provider':
        const resp = await this.hub.handle(data.origin!, { ...data.data, pageMetadata: this.pageMetadata });
        this.webView?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(resp));
        break;
    }
  };

  updateDAppNetworkConfig = (network: INetwork) => {
    if (this.dapp?.isWalletConnect) {
      WalletConnectV1ClientHub.find(this.dapp.origin)?.setLastUsedChain(network.chainId, true);
      this.dapp = { ...this.dapp!, lastUsedChainId: `${network.chainId}` };
    } else {
      this.hub.setDAppChainId(this.dapp?.origin!, network.chainId);
    }
  };

  updateDAppAccountConfig = (account: string) => {
    if (this.dapp?.isWalletConnect) {
      WalletConnectV1ClientHub.find(this.dapp.origin)?.setLastUsedAccount(account, true);
      this.dapp = { ...this.dapp!, lastUsedAccount: account };
    } else {
      this.hub.setDAppAccount(this.dapp?.origin!, account);
    }
  };
}
