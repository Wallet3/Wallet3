import * as Animatable from 'react-native-animatable';
import * as Linking from 'expo-linking';

import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useState } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation, WebViewProps } from 'react-native-webview';

import { BlurView } from 'expo-blur';
import DeviceInfo from 'react-native-device-info';
import GetPageMetadata from './scripts/Metadata';
import HookWalletConnect from './scripts/InjectWalletConnectObserver';
import { INetwork } from '../../common/Networks';
import InjectInpageProvider from './scripts/InjectInpageProvider';
import InpageMetamaskDAppHub from '../../viewmodels/hubs/InpageMetamaskDAppHub';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import MetamaskLogo from '../../assets/3rd/metamask.svg';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import { NetworksMenu } from '../../modals';
import { Portal } from 'react-native-portalize';
import WalletConnectLogo from '../../assets/3rd/walletconnect.svg';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { WebViewScrollEvent } from 'react-native-webview/lib/WebViewTypes';
import { borderColor } from '../../constants/styles';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

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

export default forwardRef(
  (
    props: WebViewProps & {
      onMetadataChange?: (metadata: { icon: string; title: string; desc?: string; origin: string }) => void;
      onGoHome?: () => void;
      separateNavBar?: boolean;
      onSeparateRequest?: (webUrl: string) => void;
      onExpandRequest?: (webUrl: string) => void;
      onBookmarksPress?: () => void;
    },
    ref: React.Ref<WebView>
  ) => {
    const { t } = i18n;
    const { onMetadataChange, onGoHome, separateNavBar, onSeparateRequest, onExpandRequest, onBookmarksPress } = props;
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [appName] = useState(`Wallet3/${DeviceInfo.getVersion() ?? '0.0.0'}`);

    const [pageMetadata, setPageMetadata] = useState<PageMetadata>();
    const [appNetwork, setAppNetwork] = useState<INetwork>();
    const [dapp, setDApp] = useState<ConnectedBrowserDApp | undefined>();
    const [webUrl, setWebUrl] = useState('');

    const updateDAppState = (dapp?: ConnectedBrowserDApp) => {
      setDApp(dapp);

      const appNetworkId = dapp?.lastUsedChainId ?? -1;
      setAppNetwork(Networks.find(appNetworkId));
    };

    const updateGlobalState = () => {
      const hostname = (Linking.parse(webUrl || 'http://').hostname ?? dapp?.origin) || '';
      if (dapp?.origin === hostname) return;

      const wcApp = WalletConnectV1ClientHub.find(hostname);

      if (wcApp && wcApp.isMobileApp) {
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

        return;
      }

      InpageMetamaskDAppHub.getDApp(hostname).then((app) => updateDAppState(app));
    };

    useEffect(() => {
      InpageMetamaskDAppHub.on('appStateUpdated', async (appState) => {
        ((ref as any).current as WebView)?.postMessage(JSON.stringify(appState));
        updateDAppState(await InpageMetamaskDAppHub.getDApp(appState.payload.origin));
      });

      InpageMetamaskDAppHub.on('dappConnected', (app) => updateDAppState(app));

      WalletConnectV1ClientHub.on('mobileAppConnected', () => {
        updateGlobalState();
      });

      return () => {
        InpageMetamaskDAppHub.removeAllListeners();
        WalletConnectV1ClientHub.removeAllListeners();
      };
    }, [webUrl]);

    useEffect(() => updateGlobalState(), [webUrl]);

    const onMessage = async (e: WebViewMessageEvent) => {
      let data: { type: string; payload: any; origin?: string; pageMetadata?: PageMetadata };

      try {
        data = JSON.parse(e.nativeEvent.data);
      } catch (error) {
        return;
      }

      switch (data.type) {
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
        case 'INPAGE_REQUEST':
          ((ref as any).current as WebView).postMessage(
            await InpageMetamaskDAppHub.handle(data.origin!, { ...data.payload, pageMetadata: data.pageMetadata ?? pageMetadata })
          );
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
        WalletConnectV1ClientHub.find(dapp.origin)?.setLastUsedChain(network.chainId);
        updateDAppState({ ...dapp!, lastUsedChainId: `${network.chainId}` });
      } else {
        InpageMetamaskDAppHub.setDAppConfigs(dapp?.origin!, { chainId: `${network.chainId}` });
      }
    };

    const tintColor = '#000000c0'; // `${appNetwork?.color ?? '#000000'}`;
    const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();

    return (
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <WebView
          {...props}
          ref={ref}
          contentInset={{ bottom: separateNavBar ? 0 : 37, top: 42.3 }}
          automaticallyAdjustContentInsets
          contentInsetAdjustmentBehavior="always"
          onNavigationStateChange={onNavigationStateChange}
          applicationNameForUserAgent={appName}
          allowsFullscreenVideo={false}
          injectedJavaScript={`${GetPageMetadata} ${HookWalletConnect}`}
          onMessage={onMessage}
          mediaPlaybackRequiresUserAction
          pullToRefreshEnabled
          allowsInlineMediaPlayback
          injectedJavaScriptBeforeContentLoaded={InjectInpageProvider}
          // style={{ marginTop: -47 }}
        />

        <BlurView
          intensity={25}
          tint="light"
          style={{
            ...styles.blurView,
            borderTopWidth: separateNavBar ? 0.33 : 0,
            position: separateNavBar ? 'relative' : 'absolute',
            shadowOpacity: separateNavBar ? 0 : 0.25,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {separateNavBar ? (
              <TouchableOpacity style={styles.navTouchableItem} onPress={() => onExpandRequest?.(webUrl)}>
                <MaterialCommunityIcons name="arrow-collapse-vertical" size={20} color={tintColor} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ ...styles.navTouchableItem, paddingTop: 10, paddingBottom: 9 }}
                onPress={() => onSeparateRequest?.(webUrl)}
              >
                <MaterialCommunityIcons name="arrow-expand" size={19} color={tintColor} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.navTouchableItem} onPress={onBookmarksPress}>
              <Feather name="book-open" size={20} color={tintColor} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={styles.navTouchableItem}
              onPress={() => ((ref as any)?.current as WebView)?.goBack()}
              disabled={!canGoBack}
            >
              <Ionicons name="chevron-back-outline" size={22} color={canGoBack ? tintColor : '#dddddd50'} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navTouchableItem} onPress={onGoHome}>
              <MaterialIcons name="radio-button-off" size={22} color={tintColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTouchableItem}
              onPress={() => ((ref as any)?.current as WebView)?.goForward()}
              disabled={!canGoForward}
            >
              <Ionicons name="chevron-forward-outline" size={22} color={canGoForward ? tintColor : '#dddddd50'} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
            {dapp && appNetwork ? (
              <Animatable.View animation={'fadeInUp'} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => openNetworksModal()}
                  style={{ paddingStart: 16, paddingEnd: 8, position: 'relative' }}
                >
                  {generateNetworkIcon({
                    chainId: appNetwork.chainId,
                    color: `${appNetwork.color}`,
                    width: 22,
                    style: {},
                    hideEVMTitle: true,
                  })}

                  {dapp?.isWalletConnect ? (
                    <WalletConnectLogo width={9} height={9} style={{ position: 'absolute', right: 5, bottom: -4 }} />
                  ) : undefined}
                </TouchableOpacity>
              </Animatable.View>
            ) : undefined}
          </View>
        </BlurView>

        <Portal>
          <Modalize
            ref={networksRef}
            adjustToContentHeight
            disableScrollIfPossible
            modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
            scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          >
            <NetworksMenu
              title={t('modal-dapp-switch-network', { app: pageMetadata?.title?.split(' ')?.[0] ?? '' })}
              networks={Networks.all}
              selectedNetwork={appNetwork}
              onNetworkPress={(network) => {
                closeNetworksModal();
                updateDAppNetworkConfig(network);
              }}
            />
          </Modalize>
        </Portal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    bottom: 0,
    left: 0,
    right: 0,

    shadowColor: `#00000060`,
    shadowOffset: {
      width: 0,
      height: -2,
    },

    elevation: 5,
    shadowRadius: 3.14,

    backgroundColor: '#ffffff20',
    borderTopColor: 'rgb(216, 216, 216)',
  },

  navTouchableItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingTop: 9,
  },
});
