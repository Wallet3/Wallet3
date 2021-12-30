import * as Linking from 'expo-linking';

import { Dimensions, TextInput, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';

import { Bar } from 'react-native-progress';
import Constants from 'expo-constants';
import Networks from '../../viewmodels/Networks';
import { borderColor } from '../../constants/styles';
import { isURL } from '../../utils/url';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWidth = Dimensions.get('window').width;

export default observer(() => {
  const { top } = useSafeAreaInsets();
  const { current } = Networks;
  const webview = useRef<WebView>(null);
  const addrRef = useRef<TextInput>(null);

  const [loadingProgress, setLoadingProgress] = useState(10);
  const [isFocus, setFocus] = useState(false);
  const [hostname, setHostname] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [addr, setAddr] = useState('');
  const [uri, setUri] = useState<string>('');

  const onAddrSubmit = () => {
    if (!isURL(addr)) return;
    addr.toLowerCase().startsWith('http') ? setUri(addr) : setUri(`http://${addr}`);
  };

  const onNavigationStateChange = (event: WebViewNavigation) => {
    if (!event.url) return;
    setWebUrl(event.url);
    setHostname(Linking.parse(event.url).hostname!);
  };

  const appName = `Wallet3/${Constants?.manifest?.version ?? '0.0.0'}`;

  return (
    <View style={{ backgroundColor: `#fff`, flex: 1, paddingTop: top, position: 'relative' }}>
      <View style={{ flexDirection: 'row', marginHorizontal: 16, paddingBottom: 8, position: 'relative' }}>
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
            paddingHorizontal: 15,
            flex: 1,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: isFocus ? borderColor : 'transparent',
            borderRadius: 7,
            textAlign: isFocus ? 'auto' : 'center',
          }}
        />

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
              marginHorizontal: -16,
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
