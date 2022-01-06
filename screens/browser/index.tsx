import * as Linking from 'expo-linking';

import { Animated, Dimensions, FlatList, ListRenderItemInfo, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Bookmarks, { Bookmark, PopularDApps } from '../../viewmodels/hubs/Bookmarks';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { borderColor, thirdFontColor } from '../../constants/styles';

import { Bar } from 'react-native-progress';
import Collapsible from 'react-native-collapsible';
import DeviceInfo from 'react-native-device-info';
import GetPageMetadata from './scripts/Metadata';
import HookWalletConnect from './scripts/InjectWalletConnectObserver';
import Image from 'react-native-expo-cached-image';
import InjectInpageProvider from './scripts/InjectInpageProvider';
import { Ionicons } from '@expo/vector-icons';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import Networks from '../../viewmodels/Networks';
import SuggestUrls from '../../configs/urls.json';
import { WebViewScrollEvent } from 'react-native-webview/lib/WebViewTypes';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWidth = Dimensions.get('window').width;
const NumOfColumns = 7;
const LargeIconSize = (ScreenWidth - 8 - 16 * NumOfColumns) / NumOfColumns;
const SmallIconSize = (ScreenWidth - 16 - 16 * 8) / 8;

export default observer(({ navigation }: BottomTabScreenProps<{}, never>) => {
  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [lastBaseY, setLastBaseY] = useState(0);

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

  const { t } = i18n;
  const { top } = useSafeAreaInsets();
  const { current } = Networks;
  const webview = useRef<WebView>(null);
  const addrRef = useRef<TextInput>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isFocus, setFocus] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [hostname, setHostname] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [addr, setAddr] = useState('');
  const [uri, setUri] = useState<string>('');
  const [pageMetadata, setPageMetadata] = useState<any>();
  const [suggests, setSuggests] = useState<string[]>([]);

  const refresh = () => {
    webview.current?.reload();
  };

  const stopLoading = () => {
    webview.current?.stopLoading();
    setLoadingProgress(1);
  };

  const goHome = () => {
    setUri('');
    setAddr('');
    setWebUrl('');
    setHostname('');
    setCanGoBack(false);
    setCanGoForward(false);
    setLoadingProgress(0);
    webview.current?.clearHistory?.();
    addrRef.current?.blur();
    showTabBar();
  };

  const goTo = (url: string) => {
    url = url.toLowerCase().startsWith('http') ? url : `https://${url}`;

    try {
      if (url === uri) {
        refresh();
        return;
      }

      setAddr(url);
      setUri(url);
      setWebUrl(url);
      setHostname(Linking.parse(url).hostname!);
    } finally {
      addrRef.current?.blur();
    }
  };

  const onAddrSubmit = async () => {
    if (!addr) {
      goHome();
      return;
    }

    if (!addr.startsWith('http') && suggests[0]) {
      goTo(suggests[0]);
      return;
    }

    goTo(addr);
  };

  const onNavigationStateChange = (event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
    setCanGoForward(event.canGoForward);

    if (!event.url) return;
    if (!event.loading) Bookmarks.submitHistory(event.url);

    setWebUrl(event.url);
    const hn = Linking.parse(event.url).hostname!;
    setHostname(hn.startsWith('www.') ? hn.substring(4) : hn);
  };

  const appName = `Wallet3/${DeviceInfo.getVersion() ?? '0.0.0'}`;

  const renderItem = ({ item }: ListRenderItemInfo<Bookmark>) => {
    return (
      <TouchableOpacity style={{ padding: 8 }} onPress={() => setUri(item.url)}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: item.icon }} style={{ width: LargeIconSize, height: LargeIconSize, borderRadius: 7 }} />
          <Text numberOfLines={1} style={{ maxWidth: LargeIconSize, marginTop: 4, fontSize: 9, color: thirdFontColor }}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    setSuggests(
      Bookmarks.history
        .concat(
          (SuggestUrls as string[]).filter((u) => !Bookmarks.history.find((hurl) => hurl.includes(u) || u.includes(hurl)))
        )
        .filter((url) => url.includes(addr) || addr.includes(url))
        .slice(0, 5)
    );
  }, [addr]);

  const onMessage = (e: WebViewMessageEvent) => {
    const data = JSON.parse(e.nativeEvent.data) as { type: string; payload: any; origin?: string };

    console.log(data);

    switch (data.type) {
      case 'metadata':
        setPageMetadata(data.payload);
        break;
      case 'wcuri':
        LinkHub.handleURL(data.payload.uri);
        break;
      case 'INPAGE_REQUEST':
        break;
    }
  };

  return (
    <View style={{ backgroundColor: `#fff`, flex: 1, paddingTop: top, position: 'relative' }}>
      <View style={{ position: 'relative', paddingTop: 4, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 6,
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => webview.current?.goBack()} disabled={!canGoBack}>
            <Ionicons name="chevron-back-outline" size={17} color={canGoBack ? '#000' : 'lightgrey'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingHorizontal: 8 }}
            onPress={() => webview.current?.goForward()}
            disabled={!canGoForward}
          >
            <Ionicons name="chevron-forward-outline" size={17} color={canGoForward ? '#000' : 'lightgrey'} />
          </TouchableOpacity>

          <View style={{ position: 'relative', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              ref={addrRef}
              autoCapitalize="none"
              keyboardType="web-search"
              placeholderTextColor="#dfdfdf"
              autoCorrect={false}
              placeholder={t('browser-enter-address')}
              selectTextOnFocus={true}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              defaultValue={isFocus ? webUrl : undefined}
              value={isFocus ? undefined : hostname}
              onChangeText={(t) => setAddr(t)}
              onSubmitEditing={() => onAddrSubmit()}
              style={{
                backgroundColor: isFocus ? '#fff' : '#f5f5f5',
                fontSize: 16,
                color: webUrl.startsWith('https') && !isFocus ? '#76B947' : undefined,
                paddingHorizontal: 8,
                flex: 1,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: isFocus ? borderColor : 'transparent',
                borderRadius: 7,
                textAlign: isFocus ? 'auto' : 'center',
              }}
            />

            {isFocus ? undefined : (
              <TouchableOpacity
                style={{ padding: 8, paddingHorizontal: 9, position: 'absolute', right: 0 }}
                onPress={() => (loadingProgress === 1 ? refresh() : stopLoading())}
              >
                {loadingProgress === 1 ? <Ionicons name="refresh" size={17} /> : undefined}
                {loadingProgress > 0 && loadingProgress < 1 ? <Ionicons name="close-outline" size={17} /> : undefined}
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={{ padding: 8 }}
            disabled={loadingProgress < 1}
            onPress={() =>
              Bookmarks.has(webUrl) ? Bookmarks.remove(webUrl) : Bookmarks.add({ ...pageMetadata, url: webUrl })
            }
          >
            <Ionicons
              name={Bookmarks.has(webUrl) ? 'bookmark' : 'bookmark-outline'}
              size={17}
              color={loadingProgress < 1 ? 'lightgrey' : '#000'}
            />
          </TouchableOpacity>
        </View>

        <Collapsible collapsed={!isFocus} style={{ borderWidth: 0, padding: 0, margin: 0 }} enablePointerEvents>
          {addr && isFocus ? (
            <View style={{ marginTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              {suggests.map((url, index) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => goTo(url)}
                  style={{
                    backgroundColor: index === 0 ? `${current.color}` : undefined,
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ maxWidth: '80%', fontSize: 16, color: index === 0 ? '#fff' : thirdFontColor }}
                  >
                    {url}
                  </Text>
                  {index === 0 ? <Ionicons name="return-down-back" size={15} color="#fff" /> : undefined}
                </TouchableOpacity>
              ))}
            </View>
          ) : undefined}

          {uri ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                padding: 8,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
              }}
            >
              {(Bookmarks.favs.length > 0 ? Bookmarks.favs.slice(0, 16) : PopularDApps).map((item, i) => (
                <TouchableOpacity style={{ margin: 8 }} key={`${item.url}-${i}`} onPress={() => goTo(item.url)}>
                  <Image
                    source={{ uri: item.icon }}
                    style={{ width: SmallIconSize, height: SmallIconSize, borderRadius: 3 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : undefined}

          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, marginTop: 4 }}>
            <TouchableOpacity style={{ width: 48 }} onPress={() => goHome()}>
              <Ionicons name="home-outline" size={20} />
            </TouchableOpacity>
          </View>
        </Collapsible>

        {loadingProgress > 0 && loadingProgress < 1 ? (
          <Bar
            width={ScreenWidth}
            color={current.color}
            height={2}
            borderWidth={0}
            borderRadius={0}
            progress={loadingProgress}
            style={{ position: 'absolute', bottom: 0 }}
          />
        ) : undefined}
      </View>

      {uri ? (
        <WebView
          ref={webview}
          applicationNameForUserAgent={appName}
          source={{ uri }}
          allowsFullscreenVideo={false}
          onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
          onLoadEnd={() => setLoadingProgress(1)}
          onNavigationStateChange={onNavigationStateChange}
          injectedJavaScript={`${GetPageMetadata} ${HookWalletConnect}`}
          onMessage={(e) => onMessage(e)}
          mediaPlaybackRequiresUserAction
          onScroll={onScroll}
          pullToRefreshEnabled
          injectedJavaScriptBeforeContentLoaded={InjectInpageProvider}
          // style={{ marginBottom: -tabBarHeight }}
        />
      ) : (
        <View>
          <Text style={{ marginHorizontal: 16, marginTop: 12 }}>{t('browser-popular-dapps')}</Text>
          <FlatList
            data={PopularDApps}
            bounces={false}
            renderItem={renderItem}
            numColumns={NumOfColumns}
            style={{ marginTop: 4 }}
            keyExtractor={(v, index) => `v.url-${index}`}
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
          />

          {Bookmarks.favs.length > 0 ? (
            <Text style={{ marginHorizontal: 16, marginTop: 12 }}>{t('browser-favorites')}</Text>
          ) : undefined}

          <FlatList
            data={Bookmarks.favs}
            bounces={false}
            renderItem={renderItem}
            numColumns={NumOfColumns}
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
            style={{ marginTop: 4 }}
            keyExtractor={(v, index) => `v.url-${index}`}
          />
        </View>
      )}
    </View>
  );
});
