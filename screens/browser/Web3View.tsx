import * as Animatable from 'react-native-animatable';
import * as Linking from 'expo-linking';

import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomTabNavigationProp, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { forwardRef, useEffect, useState } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation, WebViewProps } from 'react-native-webview';

import { BlurView } from 'expo-blur';
import DeviceInfo from 'react-native-device-info';
import GetPageMetadata from './scripts/Metadata';
import HookWalletConnect from './scripts/InjectWalletConnectObserver';
import { INetwork } from '../../common/Networks';
import InjectInpageProvider from './scripts/InjectInpageProvider';
import InpageDAppHub from '../../viewmodels/hubs/InpageDAppHub';
import { Ionicons } from '@expo/vector-icons';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import Networks from '../../viewmodels/Networks';
import { WebViewScrollEvent } from 'react-native-webview/lib/WebViewTypes';
import { generateNetworkIcon } from '../../assets/icons/networks/color';

export default forwardRef(
  (
    props: WebViewProps & {
      onMetadataChange?: (metadata: { icon: string; title: string; desc?: string; origin: string }) => void;
      navigation: BottomTabNavigationProp<any, any>;
    },
    ref: React.Ref<WebView>
  ) => {
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const { navigation, onMetadataChange, source } = props;
    const [appName] = useState(`Wallet3/${DeviceInfo.getVersion() ?? '0.0.0'}`);
    const [lastBaseY, setLastBaseY] = useState(0);
    const [tabBarHidden, setTabBarHidden] = useState(false);
    const [tabBarHeight] = useState(useBottomTabBarHeight());
    const [pageMetadata, setPageMetadata] = useState<{ icon: string; title: string; desc?: string; origin: string }>();
    const [appNetwork, setAppNetwork] = useState<INetwork>();
    const [dapp, setDApp] = useState<{ origin: string; lastUsedChainId: string; lastUsedAccount: string }>();

    const hideTabBar = () => {
      setTabBarHidden(true);

      const translateY = new Animated.Value(0);
      Animated.spring(translateY, { toValue: tabBarHeight, useNativeDriver: true }).start();
      setTimeout(() => navigation.setOptions({ tabBarStyle: { height: 0 } }), 100);
      navigation.setOptions({ tabBarStyle: { transform: [{ translateY }] } });
    };

    const showTabBar = () => {
      setTabBarHidden(false);

      const translateY = new Animated.Value(tabBarHeight);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      navigation.setOptions({ tabBarStyle: { transform: [{ translateY }], height: tabBarHeight } });
    };

    const onScroll = ({ nativeEvent }: WebViewScrollEvent) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const { y } = contentOffset;

      if (layoutMeasurement.height + y >= contentSize.height) return;

      try {
        if (y > lastBaseY) {
          if (tabBarHidden) return;
          hideTabBar();
        } else {
          if (!tabBarHidden) return;
          showTabBar();
        }
      } finally {
        setLastBaseY(Math.max(0, y));
      }
    };

    const updateDAppState = (dapp) => {
      setDApp(dapp);
      const appNetworkId = dapp?.lastUsedChainId ?? -1;
      setAppNetwork(Networks.find(appNetworkId));
    };

    useEffect(() => {
      if (!source?.['uri']) showTabBar();
    }, [source]);

    useEffect(() => {
      InpageDAppHub.on('appStateUpdated', async (appState) => {
        ((ref as any).current as WebView)?.postMessage(JSON.stringify(appState));
        updateDAppState(await InpageDAppHub.getDApp(appState.payload.origin));
      });

      InpageDAppHub.on('dappConnected', (app) => setDApp(app));

      return () => {
        InpageDAppHub.removeAllListeners();
        showTabBar();
      };
    }, []);

    useEffect(() => {
      const hostname = Linking.parse(pageMetadata?.origin ?? 'http://').hostname ?? dapp?.origin;
      InpageDAppHub.getDApp(hostname || '').then((app) => updateDAppState(app));
    }, [pageMetadata, dapp]);

    const onMessage = async (e: WebViewMessageEvent) => {
      const data = JSON.parse(e.nativeEvent.data) as { type: string; payload: any; origin?: string };

      switch (data.type) {
        case 'metadata':
          onMetadataChange?.(data.payload);
          setPageMetadata(data.payload);
          break;
        case 'wcuri':
          LinkHub.handleURL(data.payload.uri);
          break;
        case 'INPAGE_REQUEST':
          ((ref as any).current as WebView).postMessage(
            await InpageDAppHub.handle(data.origin!, { ...data.payload, pageMetadata })
          );
          break;
      }
    };

    const onNavigationStateChange = (event: WebViewNavigation) => {
      setCanGoBack(event.canGoBack);
      setCanGoForward(event.canGoForward);

      props?.onNavigationStateChange?.(event);
    };

    const tintColor = `${appNetwork?.color ?? '#000000'}dd`;

    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <WebView
          {...props}
          ref={ref}
          contentInset={{ bottom: dapp ? 0 : 36 }}
          onNavigationStateChange={onNavigationStateChange}
          applicationNameForUserAgent={appName}
          allowsFullscreenVideo={false}
          injectedJavaScript={`${GetPageMetadata} ${HookWalletConnect}`}
          onMessage={onMessage}
          mediaPlaybackRequiresUserAction
          onScroll={onScroll}
          pullToRefreshEnabled
          injectedJavaScriptBeforeContentLoaded={InjectInpageProvider}
        />

        <BlurView
          intensity={25}
          tint="light"
          style={{
            ...styles.blurView,
            borderTopWidth: dapp ? 0.33 : 0,
            position: dapp ? 'relative' : 'absolute',
            shadowOpacity: dapp ? 0 : 0.25,
          }}
        >
          <TouchableOpacity
            style={{ paddingHorizontal: 12 }}
            onPress={() => ((ref as any)?.current as WebView)?.goBack()}
            disabled={!canGoBack}
          >
            <Ionicons name="chevron-back-outline" size={22} color={canGoBack ? tintColor : '#dddddd50'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingHorizontal: 12 }}
            onPress={() => ((ref as any)?.current as WebView)?.goForward()}
            disabled={!canGoForward}
          >
            <Ionicons name="chevron-forward-outline" size={22} color={canGoForward ? tintColor : '#dddddd50'} />
          </TouchableOpacity>

          <TouchableOpacity style={{ paddingHorizontal: 12 }}>
            <Ionicons name="md-home-outline" size={22} color={tintColor} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          {dapp && appNetwork ? (
            <Animatable.View
              animation={'fadeInUp'}
              style={{ paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <TouchableOpacity>
                {generateNetworkIcon({
                  chainId: appNetwork.chainId,
                  color: `${appNetwork.color}`,
                  width: 22,
                  style: {},
                })}
              </TouchableOpacity>
            </Animatable.View>
          ) : undefined}
        </BlurView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    bottom: 0,
    left: 0,
    right: 0,

    shadowColor: `#00000060`,
    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowRadius: 3.14,

    elevation: 5,
    backgroundColor: '#ffffff20',
    borderTopColor: '#00000020',
  },
});
