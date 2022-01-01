import * as Linking from 'expo-linking';

import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import Bookmarks, { Bookmark, SuggestUrls, getFaviconJs } from '../../viewmodels/hubs/Bookmarks';
import { Dimensions, FlatList, ListRenderItemInfo, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { borderColor, thirdFontColor } from '../../constants/styles';

import { Bar } from 'react-native-progress';
import Collapsible from 'react-native-collapsible';
import Constants from 'expo-constants';
import Image from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import i18n from '../../i18n';
import { isURL } from '../../utils/url';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWidth = Dimensions.get('window').width;
const NumOfColumns = Math.ceil((ScreenWidth - 16 * 2) / (48 + 16));

export default observer(() => {
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
  };

  const goTo = (url: string) => {
    url = url.toLowerCase().startsWith('http') ? url : `http://${url}`;

    try {
      if (url === uri) {
        webview.current?.reload();
        return;
      }

      setAddr(url);
      setUri(url);
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

  const appName = `Wallet3/${Constants?.manifest?.version ?? '0.0.0'}`;

  const renderItem = ({ item }: ListRenderItemInfo<Bookmark>) => {
    return (
      <TouchableOpacity style={{ padding: 8 }} onPress={() => setUri(item.url)}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: item.icon }} style={{ width: 48, height: 48 }} />
          <Text numberOfLines={1} style={{ maxWidth: 48, marginTop: 4, fontSize: 10, color: thirdFontColor }}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    setSuggests(
      Bookmarks.history
        .concat(SuggestUrls.filter((u) => !Bookmarks.history.find((hurl) => hurl.includes(u) || u.includes(hurl))))
        .filter((url) => url.includes(addr) || addr.includes(url))
        .slice(0, 5)
    );
  }, [addr]);

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
                  <Text style={{ fontSize: 16, color: index === 0 ? '#fff' : thirdFontColor }}>{url}</Text>
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
              {Bookmarks.items.slice(0, 24).map((item, i) => (
                <TouchableOpacity style={{ margin: 8 }} key={`${item.url}-${i}`} onPress={() => goTo(item.url)}>
                  <Image source={{ uri: item.icon }} style={{ width: 32, height: 32 }} />
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
          injectedJavaScript={getFaviconJs}
          onMessage={(e) => setPageMetadata(JSON.parse(e.nativeEvent.data))}
        />
      ) : (
        <FlatList
          data={Bookmarks.items}
          bounces={false}
          renderItem={renderItem}
          numColumns={NumOfColumns}
          contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
          style={{ marginTop: 4 }}
          keyExtractor={(v, index) => `v.url-${index}`}
        />
      )}
    </View>
  );
});
