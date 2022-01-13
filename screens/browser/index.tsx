import * as Linking from 'expo-linking';

import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Bookmarks, { Bookmark, isRiskySite, isSecureSite } from '../../viewmodels/customs/Bookmarks';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { borderColor, thirdFontColor } from '../../constants/styles';

import { Bar } from 'react-native-progress';
import CachedImage from 'react-native-expo-cached-image';
import Collapsible from 'react-native-collapsible';
import InpageDAppHub from '../../viewmodels/hubs/InpageDAppHub';
import { Ionicons } from '@expo/vector-icons';
import LinkHub from '../../viewmodels/hubs/LinkHub';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import PopularDApps from '../../configs/urls/popular.json';
import { Portal } from 'react-native-portalize';
import { SafeViewContainer } from '../../components';
import SuggestUrls from '../../configs/urls/verified.json';
import Web3View from './Web3View';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DefaultIcon = require('../../assets/default-icon.png');

const ScreenWidth = Dimensions.get('window').width;
const NumOfColumns = 7;
const LargeIconSize = (ScreenWidth - 8 - 16 * NumOfColumns) / NumOfColumns;
const SmallIconSize = (ScreenWidth - 16 - 16 * 8) / 8;

export default observer(({ navigation }: BottomTabScreenProps<{}, never>) => {
  const { t } = i18n;
  const { top } = useSafeAreaInsets();
  const { current } = Networks;
  const webview = useRef<WebView>(null);
  const addrRef = useRef<TextInput>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isFocus, setFocus] = useState(false);
  const [hostname, setHostname] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const [addr, setAddr] = useState('');
  const [uri, setUri] = useState<string>('');
  const [pageMetadata, setPageMetadata] = useState<{ icon: string; title: string; desc?: string; origin: string }>();
  const [suggests, setSuggests] = useState<string[]>([]);
  const [webRiskLevel, setWebRiskLevel] = useState('');
  const { ref: favsRef, open: openFavs, close: closeFavs } = useModalize();

  useEffect(() => {
    isSecureSite(webUrl)
      ? setWebRiskLevel('verified')
      : isRiskySite(webUrl)
      ? setWebRiskLevel('risky')
      : webUrl.startsWith('https://')
      ? setWebRiskLevel('tls')
      : setWebRiskLevel('insecure');
  }, [webUrl]);

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
    setLoadingProgress(0);
    webview.current?.clearHistory?.();
    addrRef.current?.blur();
  };

  const goTo = (url: string) => {
    url = url.toLowerCase().startsWith('http') ? url : `https://${url}`;

    try {
      if (url === uri) {
        refresh();
        return url;
      }

      setPageMetadata(undefined);
      setAddr(url);
      setUri(url);
      setWebUrl(url);
      setHostname(Linking.parse(url).hostname!);
    } finally {
      addrRef.current?.blur();
    }

    return url;
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

    Bookmarks.submitHistory(goTo(addr));
  };

  const hideTabBar = () => {
    if (tabBarHidden) return;

    setTabBarHidden(true);

    const translateY = new Animated.Value(0);
    Animated.spring(translateY, { toValue: tabBarHeight, useNativeDriver: true }).start();
    setTimeout(() => navigation.setOptions({ tabBarStyle: { height: 0 } }), 100);
    navigation.setOptions({ tabBarStyle: { transform: [{ translateY }] } });
  };

  const showTabBar = () => {
    if (!tabBarHidden) return;

    setTabBarHidden(false);

    const translateY = new Animated.Value(tabBarHeight);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    navigation.setOptions({ tabBarStyle: { transform: [{ translateY }], height: tabBarHeight } });
  };

  useEffect(() => {
    if (webUrl) hideTabBar();
    else showTabBar();
  }, [webUrl]);

  const onNavigationStateChange = (event: WebViewNavigation) => {
    if (!event.url) return;

    setWebUrl(event.url);
    const hn = Linking.parse(event.url).hostname!;
    setHostname(hn.startsWith('www.') ? hn.substring(4) : hn);
  };

  const renderItem = ({ item }: ListRenderItemInfo<Bookmark>) => {
    return (
      <TouchableOpacity
        style={{ padding: 8, paddingVertical: 4 }}
        onPress={() => {
          goTo(item.url);
          closeFavs();
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {item.icon ? (
            <CachedImage
              source={{ uri: item.icon }}
              style={{ width: LargeIconSize, height: LargeIconSize, borderRadius: 7 }}
            />
          ) : (
            <Image source={DefaultIcon} style={{ width: LargeIconSize, height: LargeIconSize, borderRadius: 7 }} />
          )}

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

  return (
    <View style={{ backgroundColor: `#fff`, flex: 1, paddingTop: top, position: 'relative' }}>
      <View style={{ position: 'relative', paddingTop: 4, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 6,
            paddingStart: 8,
            position: 'relative',
            alignItems: 'center',
          }}
        >
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
                paddingHorizontal: isFocus ? 8 : 20,
                flex: 1,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: isFocus ? borderColor : 'transparent',
                borderRadius: 7,
                textAlign: isFocus ? 'auto' : 'center',
                color:
                  (webRiskLevel === 'verified' || webRiskLevel === 'tls') && !isFocus
                    ? '#76B947'
                    : webRiskLevel === 'risky'
                    ? 'red'
                    : undefined,
              }}
            />

            {isFocus ? undefined : webUrl.startsWith('https') ? (
              <TouchableOpacity style={{ position: 'absolute', left: 0, paddingStart: 8 }}>
                {webRiskLevel === 'verified' ? (
                  <Ionicons name="shield-checkmark" color={'#76B947'} size={12} style={{ marginTop: 2 }} />
                ) : webRiskLevel === 'risky' ? (
                  <Ionicons name="md-shield" color="red" size={12} style={{ marginTop: 2 }} />
                ) : webRiskLevel === 'tls' ? (
                  <Ionicons name="lock-closed" color={'#111'} size={12} />
                ) : undefined}
              </TouchableOpacity>
            ) : undefined}
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
            disabled={loadingProgress < 1 || !pageMetadata}
            onPress={() =>
              Bookmarks.has(webUrl) ? Bookmarks.remove(webUrl) : Bookmarks.add({ ...pageMetadata!, url: webUrl })
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
              {PopularDApps.concat(Bookmarks.favs.slice(0, 24)).map((item, i) => (
                <TouchableOpacity style={{ margin: 8 }} key={`${item.url}-${i}`} onPress={() => goTo(item.url)}>
                  {item.icon ? (
                    <CachedImage
                      source={{ uri: item.icon }}
                      style={{ width: SmallIconSize, height: SmallIconSize, borderRadius: 3 }}
                    />
                  ) : (
                    <Image source={DefaultIcon} style={{ width: SmallIconSize, height: SmallIconSize, borderRadius: 3 }} />
                  )}
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
        <Web3View
          ref={webview}
          source={{ uri }}
          onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
          onLoadEnd={() => setLoadingProgress(1)}
          onNavigationStateChange={onNavigationStateChange}
          onMetadataChange={setPageMetadata}
          onGoHome={goHome}
          onSeparateRequest={(webUrl) => Bookmarks.addSeparatedSite(webUrl)}
          onExpandRequest={(webUrl) => Bookmarks.removeSeparatedSite(webUrl)}
          separateNavBar={Bookmarks.isSeparatedSite(webUrl)}
          onBookmarksPress={openFavs}
        />
      ) : (
        <View>
          <Text style={{ marginHorizontal: 16, marginTop: 12 }}>{t('browser-popular-dapps')}</Text>
          <FlatList
            data={PopularDApps}
            bounces={false}
            renderItem={renderItem}
            numColumns={NumOfColumns}
            style={{ marginTop: 2 }}
            keyExtractor={(v, index) => `v.url-${index}`}
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
          />

          {Bookmarks.favs.length > 0 ? (
            <Text style={{ marginHorizontal: 16, marginTop: 12 }}>{t('browser-favorites')}</Text>
          ) : undefined}

          <FlatList
            data={Bookmarks.favs}
            renderItem={renderItem}
            style={{ height: '100%' }}
            numColumns={NumOfColumns}
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 2 }}
            keyExtractor={(v, index) => `v.url-${index}`}
          />
        </View>
      )}

      <Portal>
        <Modalize
          ref={favsRef}
          adjustToContentHeight
          disableScrollIfPossible
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          modalStyle={{ padding: 0, margin: 0 }}
        >
          <SafeAreaProvider style={{ padding: 0 }}>
            <SafeViewContainer style={{ height: 439, flex: 1, padding: 0 }}>
              <Text style={{ marginHorizontal: 12 }}>{t('browser-favorites')}</Text>
              <FlatList
                data={Bookmarks.favs.concat(
                  PopularDApps.filter((d) => !Bookmarks.favs.find((f) => f.url.includes(d.url) || d.url.includes(f.url)))
                )}
                renderItem={renderItem}
                style={{ height: '100%' }}
                numColumns={NumOfColumns}
                contentContainerStyle={{ paddingHorizontal: 4 }}
                keyExtractor={(v, index) => `v.url-${index}`}
              />
            </SafeViewContainer>
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </View>
  );
});
