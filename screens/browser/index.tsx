import * as Linking from 'expo-linking';

import Bookmarks, { Bookmark, getFaviconJs } from '../../viewmodels/hubs/Bookmarks';
import { Dimensions, FlatList, Image, ListRenderItemInfo, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { borderColor, thirdFontColor } from '../../constants/styles';

import { Bar } from 'react-native-progress';
import Collapsible from 'react-native-collapsible';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/Networks';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWidth = Dimensions.get('window').width;
const NumOfColumns = Math.ceil((ScreenWidth - 16 * 2) / (48 + 16));

export default observer(() => {
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
    setUri(url);
    addrRef.current?.blur();
  };

  const onAddrSubmit = async () => {
    if (!addr) {
      goHome();
      return;
    }

    const url = addr.toLowerCase().startsWith('http') ? addr : `http://${addr}`;
    if (url === uri) webview.current?.reload();
    setUri(url);
  };

  const onNavigationStateChange = (event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
    setCanGoForward(event.canGoForward);

    if (!event.url) return;
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
            placeholder="enter website address"
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

        {uri ? (
          <Collapsible collapsed={!isFocus} style={{ borderWidth: 0, padding: 0, margin: 0 }} enablePointerEvents>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
              {Bookmarks.items.map((item, i) => (
                <TouchableOpacity style={{ margin: 8 }} key={`${item.url}-${i}`} onPress={() => goTo(item.url)}>
                  <Image source={{ uri: item.icon }} style={{ width: 32, height: 32 }} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 4 }} />

            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2 }}>
              <TouchableOpacity style={{ width: 48 }} onPress={() => goHome()}>
                <Ionicons name="home-outline" size={20} />
              </TouchableOpacity>
            </View>
          </Collapsible>
        ) : undefined}

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
