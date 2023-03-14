import * as Animatable from 'react-native-animatable';
import * as Linking from 'expo-linking';

import Animated, { ComplexAnimationBuilder, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation, WebViewProps } from 'react-native-webview';

import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/core/App';
import Avatar from '../../components/Avatar';
import { EOA } from '../../viewmodels/account/EOA';
import GetPageMetadata from './scripts/Metadata';
import HookRainbowKit from './scripts/InjectRainbowKitObserver';
import HookWalletConnect from './scripts/InjectWalletConnectObserver';
import { INetwork } from '../../common/Networks';
import { InpageDAppController } from './controller/InpageDAppController';
import { JS_POST_MESSAGE_TO_PROVIDER } from './scripts/Utils';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import MetamaskMobileProvider from './scripts/Metamask-mobile-provider';
import Networks from '../../viewmodels/core/Networks';
import { NetworksMenu } from '../../modals';
import { Portal } from 'react-native-portalize';
import SquircleModalize from '../../modals/core/SquircleModalize';
import Theme from '../../viewmodels/settings/Theme';
import { UA } from '../../utils/platform';
import ViewShot from 'react-native-view-shot';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import WalletConnectLogo from '../../assets/3rd/walletconnect.svg';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface PageMetadata {
  icon: string;
  title: string;
  name?: string;
  origin: string;
  hostname: string;
  desc?: string;
  themeColor: string | null;
}

interface ConnectedBrowserDApp {
  origin: string;
  lastUsedChainId: string;
  lastUsedAccount: string;
  isWalletConnect?: boolean;
}

interface Web3ViewProps extends WebViewProps {
  onMetadataChange?: (metadata: PageMetadata) => void;
  onAppNetworkChange?: (network?: INetwork) => void;
  onGoHome?: () => void;
  onNewTab?: () => void;
  expanded?: boolean;
  onBookmarksPress?: () => void;
  onTabPress?: () => void;
  tabCount?: number;

  webViewRef: React.Ref<WebView>;
  viewShotRef?: React.Ref<ViewShot>;
}

export default observer((props: Web3ViewProps) => {
  const { t } = i18n;
  const { webViewRef, viewShotRef, tabCount, onTabPress } = props;
  const [hub] = useState(new InpageDAppController());

  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { onMetadataChange, onGoHome, onNewTab, expanded, onBookmarksPress, onAppNetworkChange } = props;

  const networkIndicator = useRef<Animatable.View>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const [pageMetadata, setPageMetadata] = useState<PageMetadata>();
  const [appNetwork, setAppNetwork] = useState<INetwork>();
  const [appAccount, setAppAccount] = useState<EOA>();
  const [dapp, setDApp] = useState<ConnectedBrowserDApp | undefined>();
  const [webUrl, setWebUrl] = useState('');
  const [exitingTransition, setExitingTransition] = useState<ComplexAnimationBuilder>();

  const { mode, foregroundColor, isLightMode, backgroundColor, systemBorderColor } = Theme;

  const updateDAppState = (dapp?: ConnectedBrowserDApp) => {
    setDApp(dapp);
    setExitingTransition(dapp ? undefined : FadeOutDown.duration(1000).springify());

    const network = Networks.find(dapp?.lastUsedChainId ?? -1);
    setAppNetwork(network);
    setAppAccount(App.findAccount(dapp?.lastUsedAccount ?? ''));

    onAppNetworkChange?.(network);
  };

  const updateGlobalState = () => {
    const hostname = (Linking.parse(webUrl || 'http://').hostname ?? dapp?.origin) || '';
    if (dapp?.origin === hostname) return;

    const wcApp = WalletConnectHub.find(hostname);

    if (wcApp?.isMobileApp || wcApp?.version === 2) {
      updateDAppState({
        lastUsedChainId: wcApp.lastUsedChainId,
        lastUsedAccount: wcApp.lastUsedAccount,
        origin: wcApp.origin,
        isWalletConnect: true,
      });

      wcApp.once('disconnect', () => {
        // console.log(dapp?.origin, wcApp.origin);
        // if (!dapp?.isWalletConnect) return;
        // if (dapp.origin !== origin) return;
        updateDAppState(undefined);
      });

      wcApp.on('lastUsedChainChanged', (chainId, from) => {
        updateDAppState({
          lastUsedChainId: wcApp.lastUsedChainId,
          lastUsedAccount: wcApp.lastUsedAccount,
          origin: wcApp.origin,
          isWalletConnect: true,
        });

        if (from === 'inpage') networkIndicator.current?.flash?.();
      });

      return;
    }

    updateDAppState(hub.getDApp(hostname));
  };

  useEffect(() => {
    const notifyWebView = async (appState, from?: 'user' | 'inpage') => {
      const webview = (webViewRef as any).current as WebView;
      webview?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(appState));
      updateDAppState(hub.getDApp(appState.origin));

      if (from !== 'inpage') return;
      networkIndicator.current?.flash?.();
    };

    hub.on('appChainUpdated_metamask', notifyWebView);
    hub.on('appAccountUpdated_metamask', notifyWebView);

    hub.on('dappConnected', (app) => updateDAppState(app));

    WalletConnectHub.on('mobileAppConnected', updateGlobalState);

    if (pageMetadata) ((webViewRef as any)?.current as WebView)?.injectJavaScript(`${GetPageMetadata}\ntrue;`);

    return () => {
      hub.removeAllListeners();
      WalletConnectHub.off('mobileAppConnected', updateGlobalState);
    };
  }, [webUrl]);

  useEffect(() => updateGlobalState(), [webUrl]);

  const onMessage = async (e: WebViewMessageEvent) => {
    let data: { type: string; payload: any; origin?: string; pageMetadata?: PageMetadata; name?: string; data: any };

    try {
      data = JSON.parse(e.nativeEvent.data);
    } catch (error) {
      return;
    }

    switch (data.type ?? data.name) {
      case 'metadata':
        onMetadataChange?.(data.payload);
        setPageMetadata(data.payload);
        break;
      case 'wcuri':
        LinkHub.handleURL(data.payload.uri, {
          fromMobile: true,
          hostname: Linking.parse(pageMetadata?.origin ?? 'https://').hostname ?? '',
        });
        break;
      case 'metamask-provider':
        const resp = await hub.handle(data.origin!, { ...data.data, pageMetadata });

        const webview = (webViewRef as any).current as WebView;
        webview?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(resp));
        break;
    }
  };

  const onNavigationStateChange = (event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
    setCanGoForward(event.canGoForward);
    setWebUrl(event.url);

    props?.onNavigationStateChange?.(event);
  };

  const updateDAppNetworkConfig = (network: INetwork) => {
    if (dapp?.isWalletConnect) {
      WalletConnectHub.find(dapp.origin)?.setLastUsedChain(network.chainId, true);
      updateDAppState({ ...dapp!, lastUsedChainId: `${network.chainId}` });
    } else {
      hub.setDAppChainId(dapp?.origin!, network.chainId);
    }

    closeNetworksModal();
  };

  const updateDAppAccountConfig = (account: string) => {
    if (dapp?.isWalletConnect) {
      WalletConnectHub.find(dapp.origin)?.setLastUsedAccount(account, true);
      updateDAppState({ ...dapp!, lastUsedAccount: account });
    } else {
      hub.setDAppAccount(dapp?.origin!, account);
    }

    closeAccountsModal();
  };

  const tintColor = isLightMode ? '#000000c0' : foregroundColor;
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: accountsRef, open: openAccountsModal, close: closeAccountsModal } = useModalize();

  return (
    <Animated.View style={{ flex: 1, position: 'relative' }} exiting={exitingTransition}>
      <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ result: 'tmpfile', quality: 0.1, format: 'jpg' }}>
        <WebView
          {...props}
          ref={webViewRef}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior={'never'}
          contentInset={{ bottom: expanded ? 37 + (safeAreaBottom === 0 ? 8 : 0) : 0 }}
          onNavigationStateChange={onNavigationStateChange}
          userAgent={UA}
          allowsFullscreenVideo={false}
          forceDarkOn={mode === 'dark'}
          injectedJavaScript={`${GetPageMetadata}\ntrue;\n${HookWalletConnect}\n${HookRainbowKit}\ntrue;`}
          onMessage={onMessage}
          mediaPlaybackRequiresUserAction
          pullToRefreshEnabled
          allowsInlineMediaPlayback
          allowsBackForwardNavigationGestures
          injectedJavaScriptBeforeContentLoaded={`${MetamaskMobileProvider}\ntrue;`}
          onContentProcessDidTerminate={() => ((webViewRef as any)?.current as WebView)?.reload()}
          style={{ backgroundColor }}
          decelerationRate={1}
          allowsLinkPreview
        />
      </ViewShot>

      <Animatable.View
        animation="fadeInUp"
        style={{ bottom: 0, left: 0, right: 0, position: expanded ? 'absolute' : 'relative' }}
      >
        <View
          style={{
            ...styles.blurView,
            backgroundColor,
            paddingVertical: safeAreaBottom === 0 ? 4 : undefined,
            borderTopWidth: 0.333,
            borderTopColor: systemBorderColor,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {(tabCount || 0) > 0 ? (
              <TouchableOpacity style={styles.navTouchableItem} onPress={onTabPress}>
                <View
                  style={{
                    borderWidth: 1.5,
                    borderColor: tintColor,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                    borderRadius: 7,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 12, minWidth: 12, textAlign: 'center', color: tintColor }}>
                    {tabCount}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : undefined}

            <TouchableOpacity style={styles.navTouchableItem} onPress={onBookmarksPress}>
              <Feather name="book-open" size={20.5} color={tintColor} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={styles.navTouchableItem}
              onPress={() => ((webViewRef as any)?.current as WebView)?.goBack()}
              disabled={!canGoBack}
            >
              <Ionicons name="chevron-back-outline" size={22} color={canGoBack ? tintColor : '#dddddd50'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTouchableItem}
              onPress={() => (dapp ? (onNewTab || onGoHome)?.() : onGoHome?.())}
            >
              <Entypo name="circle" size={19} color={tintColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTouchableItem}
              onPress={() => ((webViewRef as any)?.current as WebView)?.goForward()}
              disabled={!canGoForward}
            >
              <Ionicons name="chevron-forward-outline" size={22} color={canGoForward ? tintColor : '#dddddd50'} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            {dapp ? (
              <Animated.View entering={FadeInDown.delay(0)} exiting={FadeOut.delay(0)}>
                <TouchableOpacity style={{ paddingHorizontal: 8, marginBottom: -0.5 }} onPress={() => openAccountsModal()}>
                  <Avatar
                    size={25}
                    uri={appAccount?.avatar}
                    emoji={appAccount?.emojiAvatar ?? '❓'}
                    emojiSize={11}
                    backgroundColor={appAccount?.emojiColor ?? '#e0e0e0'}
                  />
                </TouchableOpacity>
              </Animated.View>
            ) : undefined}

            {dapp ? (
              <Animatable.View
                ref={networkIndicator as any}
                animation={'fadeInUp'}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <TouchableOpacity
                  onPress={() => openNetworksModal()}
                  style={{ paddingStart: 16, paddingEnd: 10, position: 'relative' }}
                >
                  {generateNetworkIcon({
                    ...(appNetwork || { chainId: 0, color: '#ccc' }),
                    width: appNetwork?.browserBarIconSize ?? 23,
                    height: appNetwork?.browserBarIconSize ?? 23,
                    hideEVMTitle: true,
                  })}

                  {dapp?.isWalletConnect ? (
                    <WalletConnectLogo width={9} height={9} style={{ position: 'absolute', right: 5, bottom: -4 }} />
                  ) : undefined}
                </TouchableOpacity>
              </Animatable.View>
            ) : undefined}
          </View>
        </View>
      </Animatable.View>

      <Portal>
        <SquircleModalize ref={networksRef}>
          <NetworksMenu
            title={t('modal-dapp-switch-network', { app: pageMetadata?.title?.split(' ')?.[0] ?? '' })}
            selectedNetwork={appNetwork}
            onNetworkPress={(network) => updateDAppNetworkConfig(network)}
          />
        </SquircleModalize>

        <SquircleModalize ref={accountsRef}>
          <ScrollView
            scrollEnabled={false}
            horizontal
            style={{ width: '100%', flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <AccountSelector
              single
              accounts={App.allAccounts}
              selectedAccounts={appAccount ? [appAccount.address] : []}
              style={{ padding: 16, height: 430 }}
              expanded
              themeColor={appNetwork?.color}
              onDone={([account]) => updateDAppAccountConfig(account)}
            />
          </ScrollView>
        </SquircleModalize>
      </Portal>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,

    borderTopColor: 'rgb(216, 216, 216)',
  },

  navTouchableItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
