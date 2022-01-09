import { BottomTabNavigationProp, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation, WebViewProps } from 'react-native-webview';

import { Animated } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import GetPageMetadata from './scripts/Metadata';
import HookWalletConnect from './scripts/InjectWalletConnectObserver';
import InjectInpageProvider from './scripts/InjectInpageProvider';
import InpageDAppHub from '../../viewmodels/hubs/InpageDAppHub';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import { View } from 'react-native';
import { WebViewScrollEvent } from 'react-native-webview/lib/WebViewTypes';

export default forwardRef(
  (
    props: WebViewProps & {
      onMetadataChange?: (metadata: { icon: string; title: string; desc?: string; origin: string }) => void;
      navigation: BottomTabNavigationProp<any, any>;
    },
    ref: React.Ref<WebView>
  ) => {
    const { navigation, onMetadataChange, source } = props;
    const [appName] = useState(`Wallet3/${DeviceInfo.getVersion() ?? '0.0.0'}`);
    const [lastBaseY, setLastBaseY] = useState(0);
    const [tabBarHidden, setTabBarHidden] = useState(false);
    const [tabBarHeight] = useState(useBottomTabBarHeight());
    const [pageMetadata, setPageMetadata] = useState<{ icon: string; title: string; desc?: string; origin: string }>();

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

    useEffect(() => {
      if (!source?.['uri']) showTabBar();
    }, [source]);

    useEffect(() => {
      InpageDAppHub.on('appStateUpdated', (appState) => {
        if (pageMetadata?.origin !== appState.origin) return;
        ((ref as any).current as WebView)?.postMessage(JSON.stringify(appState));
      });
    }, []);

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
          try {
            ((ref as any).current as WebView).postMessage(
              await InpageDAppHub.handle(data.origin!, { ...data.payload, pageMetadata })
            );
          } catch (error) {
            console.log(error);
          }
          break;
      }
    };

    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <WebView
          {...props}
          ref={ref}
          applicationNameForUserAgent={appName}
          allowsFullscreenVideo={false}
          injectedJavaScript={`${GetPageMetadata} ${HookWalletConnect}`}
          onMessage={onMessage}
          mediaPlaybackRequiresUserAction
          onScroll={onScroll}
          pullToRefreshEnabled
          injectedJavaScriptBeforeContentLoaded={InjectInpageProvider}
        />
      </View>
    );
  }
);
