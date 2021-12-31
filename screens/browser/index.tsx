import * as Linking from 'expo-linking';

import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';

import { Bar } from 'react-native-progress';
import CollapsibleView from '@eliav2/react-native-collapsible-view';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/Networks';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWidth = Dimensions.get('window').width;

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

  const onAddrSubmit = async () => {
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

  return (
    <View style={{ backgroundColor: `#fff`, flex: 1, paddingTop: top, position: 'relative' }}>
      <View style={{ position: 'relative', paddingBottom: 8 }}>
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

          <TouchableOpacity style={{ paddingHorizontal: 8 }}>
            <Ionicons name="bookmark-outline" size={17} />
          </TouchableOpacity>
        </View>

        {uri ? (
          <CollapsibleView
            noArrow
            arrowStyling={{ display: 'none' }}
            titleStyle={{ display: 'none' }}
            expanded={isFocus}
            style={{ borderWidth: 0, padding: 0, paddingHorizontal: 6 }}
            collapsibleContainerStyle={{}}
          >
            <Text>hey there!</Text>
          </CollapsibleView>
        ) : undefined}

        {loadingProgress > 0 && loadingProgress < 1 ? (
          <Bar
            width={ScreenWidth}
            color={current.color}
            height={2}
            borderWidth={0}
            borderRadius={0}
            progress={loadingProgress}
            style={{
              position: 'absolute',
              bottom: 0,
            }}
          />
        ) : undefined}
      </View>

      <WebView
        ref={webview}
        applicationNameForUserAgent={appName}
        source={{ uri }}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
        onLoadEnd={() => setLoadingProgress(1)}
        onNavigationStateChange={onNavigationStateChange}
      />
    </View>
  );
});
