import * as Animatable from 'react-native-animatable';
import * as Linking from 'expo-linking';

import Animated, { FadeInDown } from 'react-native-reanimated';
import Bookmarks, { HttpsSecureUrls, isRiskySite, isSecureSite } from '../../viewmodels/customs/Bookmarks';
import { BreathAnimation, startLayoutAnimation } from '../../utils/animations';
import { Button, NullableImage } from '../../components';
import { Dimensions, Share, StyleProp, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Web3View, { PageMetadata } from './Web3View';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { secureColor, thirdFontColor, warningColor } from '../../constants/styles';

import AnimatedLottieView from 'lottie-react-native';
import { Bar } from 'react-native-progress';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Collapsible from 'react-native-collapsible';
import IllustrationAlert from '../../assets/illustrations/misc/alert.svg';
import { Ionicons } from '@expo/vector-icons';
import LINQ from 'linq';
import MessageKeys from '../../common/MessageKeys';
import Networks from '../../viewmodels/core/Networks';
import PopularDApps from '../../configs/urls/popular.json';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import RecentHistory from './components/RecentHistory';
import { ScrollView } from 'react-native-gesture-handler';
import { SectionGrid } from 'react-native-super-grid';
import { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import SquircleModalize from '../../modals/core/SquircleModalize';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import ViewShot from 'react-native-view-shot';
import i18n from '../../i18n';
import { isAndroid } from '../../utils/platform';
import { isURL } from '../../utils/url';
import { observer } from 'mobx-react-lite';
import { renderUserBookmarkItem } from './components/BookmarkItem';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const calcIconSize = () => {
  const { width } = ReactiveScreen;

  const NumOfColumns = Math.ceil(width / 64);
  const LargeIconSize = (width - 8 - 16 * NumOfColumns) / NumOfColumns;
  const SmallIconSize = (width - 16 - 16 * (NumOfColumns + 1)) / (NumOfColumns + 1);

  return { NumOfColumns, LargeIconSize, SmallIconSize };
};

const { LargeIconSize, SmallIconSize } = calcIconSize();

type WebRiskLevel = 'verified' | 'tls' | 'insecure' | 'risky';

const RegexHttps = /^https?\:/i;
const RegexSocials = /(twitter\.com|t\.me|facebook\.com|whatsapp\.com)/i;

interface Props {
  pageId: number;
  navigation?: BottomTabNavigationProp<any, any>;
  onPageLoaded?: (pageId: number, metadata?: PageMetadata) => void;
  onPageLoadEnd?: () => void;
  onHome?: () => void;
  onTakeOff?: () => void;
  onNewTab?: () => void;
  globalState?: { pageCount: number; activePageId: number };
  onOpenTabs?: () => void;
  setCapture?: (callback: () => Promise<string>) => void;
  onInputting?: (inputting: boolean) => void;
  initUrl?: string;
  disableExtraFuncs?: boolean;
  singlePage?: boolean;
  disableRecordRecentHistory?: boolean;
}

export const Browser = observer(
  ({
    navigation,
    onPageLoaded,
    onHome,
    onTakeOff,
    pageId,
    onNewTab,
    globalState,
    onOpenTabs,
    setCapture,
    onPageLoadEnd,
    onInputting,
    disableExtraFuncs,
    singlePage,
    initUrl,
    disableRecordRecentHistory,
  }: Props) => {
    const { t } = i18n;
    const { top } = useSafeAreaInsets();

    const webview = useRef<WebView>(null);
    const addrRef = useRef<TextInput>(null);
    const viewShot = useRef<ViewShot>(null);

    const [appNetworkColor, setAppNetworkColor] = useState(Networks.current.color);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isFocus, setFocus] = useState(false);
    const [hostname, setHostname] = useState('');
    const [webUrl, setWebUrl] = useState(initUrl || '');

    const [addr, setAddr] = useState('');
    const [uri, setUri] = useState<string>('');
    const [pageMetadata, setPageMetadata] = useState<{ icon: string; title: string; desc?: string; origin: string }>();
    const [suggests, setSuggests] = useState<string[]>([]);
    const [webRiskLevel, setWebRiskLevel] = useState<WebRiskLevel>('insecure');

    const { ref: favsRef, open: openFavs, close: closeFavs } = useModalize();
    const { ref: riskyRef, open: openRiskyTip, close: closeRiskyTip } = useModalize();

    const [largeIconSize, setLargeIconSize] = useState(LargeIconSize);
    const [smallIconSize, setSmallIconSize] = useState(SmallIconSize);

    const { history, favs, recentSites } = Bookmarks;
    const { backgroundColor, secondaryTextColor, textColor, borderColor, foregroundColor, isLightMode, statusBarStyle } =
      Theme;

    useEffect(() => {
      const handler = () => {
        const { LargeIconSize, SmallIconSize } = calcIconSize();

        setLargeIconSize(LargeIconSize);
        setSmallIconSize(SmallIconSize);
      };

      const changeListener = Dimensions.addEventListener('change', handler);

      const subToken = PubSub.subscribe(MessageKeys.openUrlInPageId(pageId), (msg, { data }) => {
        addrRef?.current?.blur();
        setTimeout(() => goTo(data), 100);
      });

      return () => {
        changeListener.remove();
        PubSub.unsubscribe(subToken);
        onInputting = undefined;
      };
    }, []);

    useEffect(() => onInputting?.(isFocus), [isFocus]);

    useEffect(() => {
      const func = viewShot.current?.capture;
      if (!func) return;

      setCapture?.(func);
    }, [viewShot.current]);

    useEffect(() => {
      isSecureSite(webUrl)
        ? setWebRiskLevel('verified')
        : isRiskySite(webUrl).then((risky) => {
            if (risky) {
              setWebRiskLevel('risky');
              openRiskyTip();
            } else {
              webUrl.startsWith('https://') ? setWebRiskLevel('tls') : setWebRiskLevel('insecure');
            }
          });
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
      onHome?.();
    };

    const goTo = (url: string) => {
      const lower = url.toLowerCase();
      url =
        lower.startsWith('https:') || lower.startsWith('http:')
          ? url
          : isURL(url)
          ? `https://${url}`
          : `https://www.google.com/search?client=wallet3&ie=UTF-8&oe=UTF-8&q=${url}`;

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

        if (!disableRecordRecentHistory) Bookmarks.submitHistory(url);
      } finally {
        addrRef.current?.blur();
      }

      onTakeOff?.();

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

      goTo(addr);
    };

    const onShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
      const isExternalLink = !RegexHttps.test(event.url) || RegexSocials.test(event.url);

      if (event.url !== 'about:blank' && isExternalLink) {
        Linking.openURL(event.url);
        return false;
      }

      return true;
    };

    const onNavigationStateChange = (event: WebViewNavigation) => {
      if (!event.url) return;

      setWebUrl(event.url);
      const hn = Linking.parse(event.url).hostname!;
      setHostname(hn.startsWith('www.') ? hn.substring(4) : hn);
    };

    useEffect(() => {
      if (!addr) {
        setSuggests([]);
        return;
      }

      setSuggests(
        Array.from(new Set(LINQ.from(history.concat(HttpsSecureUrls)).where((url) => url.includes(addr)))).slice(0, 5)
      );
    }, [addr]);

    useEffect(() => {
      if (!initUrl) return;
      goTo(initUrl);
    }, [initUrl]);

    const SectionBookmarks = ({
      bounces,
      style,
      itemContainerStyle,
    }: {
      bounces?: boolean;
      style?: StyleProp<ViewStyle>;
      itemContainerStyle?: StyleProp<ViewStyle>;
    }) => (
      <SectionGrid
        sections={favs}
        style={{ marginTop: 0, padding: 0, height: '100%', ...(style || ({} as any)) }}
        itemDimension={LargeIconSize + 8}
        bounces={bounces}
        data={favs}
        itemContainerStyle={{ padding: 0, margin: 0, marginBottom: 8, ...(itemContainerStyle || ({} as any)) }}
        spacing={8}
        initialNumToRender={99}
        keyExtractor={(v, index) => `${v.url}-${Bookmarks.has(v.url) || 'ng'}-${index}`}
        renderSectionHeader={({ section }) => (
          <Text
            style={{
              fontSize: 12,
              paddingHorizontal: 15,
              fontWeight: '400',
              textShadowColor: '#fff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 3,
              color: foregroundColor,
            }}
          >
            {t(`browser-sections-${section.title.toLowerCase()}`)}
          </Text>
        )}
        renderItem={(p) =>
          renderUserBookmarkItem({
            ...p,
            iconSize: LargeIconSize,
            imageBackgroundColor: backgroundColor,
            onPress: (item) => {
              goTo(item.url);
              closeFavs();
            },
            onRemove: (item) => {
              startLayoutAnimation();
              Bookmarks.remove(item.url);
            },
          })
        }
      />
    );

    return (
      <Animated.View
        style={{
          backgroundColor: backgroundColor,
          flex: 1,
          width: ReactiveScreen.width,
          paddingTop: top,
          position: 'relative',
        }}
      >
        <Animated.View style={{ position: 'relative', paddingTop: 4, paddingBottom: isFocus ? 0 : 8 }}>
          <Animated.View
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
                selectTextOnFocus
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                defaultValue={isFocus ? webUrl : undefined}
                value={isFocus ? undefined : hostname}
                onChangeText={(t) => setAddr(t)}
                onSubmitEditing={() => onAddrSubmit()}
                style={{
                  backgroundColor: isFocus ? (isLightMode ? '#fff' : '#000') : isLightMode ? '#f5f5f5' : '#f5f5f520',
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
                      ? isLightMode
                        ? secureColor
                        : '#66db0d'
                      : webRiskLevel === 'risky'
                      ? warningColor
                      : textColor,
                }}
              />

              {isFocus || !webUrl ? undefined : (
                <TouchableOpacity style={{ position: 'absolute', left: 0, paddingStart: 8 }}>
                  {webRiskLevel === 'verified' ? (
                    <Ionicons
                      name="shield-checkmark"
                      color={isLightMode ? secureColor : '#66db0d'}
                      size={12}
                      style={{ marginTop: 2 }}
                    />
                  ) : webRiskLevel === 'risky' || (webRiskLevel === 'insecure' && loadingProgress === 1) ? (
                    <Ionicons name="warning" color={warningColor} size={12} style={{ marginTop: 2 }} />
                  ) : webRiskLevel === 'tls' ? (
                    <Ionicons name="lock-closed" color={foregroundColor} size={12} />
                  ) : undefined}
                </TouchableOpacity>
              )}
              {isFocus ? undefined : (
                <TouchableOpacity
                  style={{ padding: 8, paddingHorizontal: 9, position: 'absolute', right: 0 }}
                  onPress={() => (loadingProgress === 1 ? refresh() : stopLoading())}
                >
                  {loadingProgress === 1 ? <Ionicons name="refresh" size={17} color={foregroundColor} /> : undefined}
                  {loadingProgress > 0 && loadingProgress < 1 ? (
                    <Ionicons name="close-outline" size={17} color={foregroundColor} />
                  ) : undefined}
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={{ padding: 6, paddingStart: 10, marginStart: 4 }}
              disabled={loadingProgress < 1 || !pageMetadata}
              onPress={() =>
                Bookmarks.has(webUrl) ? Bookmarks.remove(webUrl) : Bookmarks.add({ ...pageMetadata!, url: webUrl })
              }
            >
              <Ionicons
                name={Bookmarks.has(webUrl) ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={loadingProgress < 1 ? 'lightgrey' : foregroundColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ padding: 4, paddingHorizontal: 6, paddingTop: 4.5 }}
              onPress={() => Share.share({ url: webUrl, title: pageMetadata?.title })}
              disabled={loadingProgress < 1 || !webUrl}
            >
              <Ionicons name={'share-outline'} size={19} color={loadingProgress < 1 ? 'lightgrey' : foregroundColor} />
            </TouchableOpacity>
          </Animated.View>

          <Collapsible collapsed={!isFocus} style={{ borderWidth: 0, padding: 0, margin: 0 }} enablePointerEvents>
            <View style={{ marginTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              {suggests.map((url, index) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => goTo(url)}
                  style={{
                    backgroundColor: index === 0 ? `${appNetworkColor}` : 'transparent',
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
                    {url.startsWith('http') ? url : `https://${url}`}
                  </Text>
                  {index === 0 ? <Ionicons name="return-down-back" size={15} color="#fff" /> : undefined}
                </TouchableOpacity>
              ))}
            </View>

            {webUrl && !disableExtraFuncs ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  padding: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: borderColor,
                }}
              >
                {PopularDApps.concat(uri ? Bookmarks.flatFavs.slice(0, 24 - PopularDApps.length) : []).map((item, i) => (
                  <TouchableOpacity
                    style={{ margin: 8 }}
                    key={`${item.url}-${i}`}
                    onPress={(e) => {
                      e.preventDefault();
                      goTo(item.url);
                    }}
                  >
                    <NullableImage
                      uri={item.icon}
                      imageBackgroundColor={backgroundColor}
                      imageRadius={3}
                      size={smallIconSize}
                      text={item.title}
                      fontSize={12}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : undefined}

            {disableExtraFuncs ? undefined : (
              <View style={{ flexDirection: 'row', paddingHorizontal: 0 }}>
                <TouchableOpacity
                  onPress={() => PubSub.publish(MessageKeys.openGlobalQRScanner, t('qrscan-tip-3'))}
                  style={{
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    paddingVertical: 8,
                  }}
                >
                  <Ionicons name="md-scan-outline" size={21} color={textColor} />
                </TouchableOpacity>
              </View>
            )}
          </Collapsible>

          {loadingProgress > 0 && loadingProgress < 1 ? (
            <Bar
              width={ReactiveScreen.width}
              color={appNetworkColor}
              height={2}
              borderWidth={0}
              borderRadius={0}
              progress={loadingProgress}
              style={{ position: 'absolute', bottom: 0 }}
            />
          ) : undefined}
        </Animated.View>

        {uri ? (
          <Web3View
            originWhitelist={['http://*', 'https://*', 'intent://*']}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={isAndroid ? onShouldStartLoadWithRequest : undefined}
            webViewRef={webview}
            viewShotRef={viewShot}
            tabCount={globalState?.pageCount}
            onTabPress={onOpenTabs}
            source={{ uri }}
            onLoadStart={() => {
              let hostname = '';
              try {
                hostname = Linking.parse(uri).hostname!;
              } catch (error) {}

              onPageLoaded?.(pageId, {
                hostname,
                origin: uri,
                icon: '',
                themeColor: '#ccc',
                title: hostname,
              });
            }}
            onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
            onLoadEnd={() => {
              setLoadingProgress(1);
              onPageLoadEnd?.();
            }}
            onAppNetworkChange={(network) => setAppNetworkColor((network || Networks.current).color)}
            onNavigationStateChange={onNavigationStateChange}
            onGoHome={goHome}
            onNewTab={onNewTab}
            onBookmarksPress={openFavs}
            onMetadataChange={(data) => {
              setPageMetadata(data);
              onPageLoaded?.(pageId, data);
              if (!disableRecordRecentHistory) Bookmarks.addRecentSite(data);
            }}
          />
        ) : (
          <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(1000).springify()}>
            {favs.length === 0 && !disableExtraFuncs && (
              <View
                style={{
                  position: 'absolute',
                  left: ReactiveScreen.width / 2 - 182,
                  marginTop: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Animatable.View
                  animation={BreathAnimation}
                  iterationCount="infinite"
                  duration={4000}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                >
                  <Ionicons name="arrow-up" color="#70d44b" size={16} style={{ marginEnd: 8 }} />
                  <Text style={{ color: '#70d44b' }}>{t('browser-enter-address-tip')}</Text>
                </Animatable.View>
                <AnimatedLottieView
                  source={require('../../assets/animations/web-dev.json')}
                  autoPlay
                  style={{ width: 300, height: 300 }}
                />
              </View>
            )}

            {disableExtraFuncs ? undefined : (
              <SectionBookmarks bounces={favs.length >= 5 && Bookmarks.flatFavs.length > 20 ? true : false} />
            )}
          </Animated.View>
        )}

        {!webUrl && recentSites.length > 0 ? (
          <RecentHistory tabCount={globalState?.pageCount} onItemPress={(url) => goTo(url)} onTabsPress={onOpenTabs} />
        ) : undefined}

        <Portal>
          <SquircleModalize ref={favsRef} safeAreaStyle={{ height: 439, padding: 0 }} useSafeBottom>
            <ScrollView horizontal scrollEnabled={false} style={{ flex: 1 }}>
              <SectionBookmarks bounces={favs.length >= 3} style={{ paddingTop: 12, flex: 1, width: ReactiveScreen.width }} />
            </ScrollView>

            <RecentHistory
              disableContextMenu
              onItemPress={(url) => {
                goTo(url);
                closeFavs();
              }}
            />
          </SquircleModalize>

          <SquircleModalize
            ref={riskyRef}
            closeOnOverlayTap={false}
            safeAreaStyle={{ height: 439, padding: 0 }}
            squircleContainerStyle={{ backgroundColor: warningColor, padding: 16 }}
            useSafeBottom
          >
            <Text
              numberOfLines={1}
              style={{
                color: '#fff',
                fontSize: 27,
                fontWeight: '600',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {t('modal-phishing-title')}
            </Text>

            <IllustrationAlert width={120} height={120} style={{ alignSelf: 'center', marginVertical: 8 }} />

            <Text
              style={{
                color: '#fff',
                marginTop: 12,
                fontSize: 16,
                fontWeight: '500',
                lineHeight: 21,
              }}
            >
              {t('modal-phishing-content', { webUrl: `${webUrl.startsWith('https:') ? 'https' : 'http'}://${hostname}` })}
            </Text>

            <View style={{ flex: 1 }} />

            <Button
              themeColor="darkorange"
              txtStyle={{ color: '#fff', textTransform: 'none' }}
              title="OK"
              onPress={closeRiskyTip}
            />
          </SquircleModalize>
        </Portal>

        <StatusBar style={statusBarStyle} />
      </Animated.View>
    );
  }
);

export default Browser;
