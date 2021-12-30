import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import Constants from 'expo-constants';
import Networks from '../../viewmodels/Networks';
import { TextBox } from '../../components';
import { WebView } from 'react-native-webview';
import { borderColor } from '../../constants/styles';
import { isURL } from '../../utils/url';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default (props) => {
  const { top } = useSafeAreaInsets();
  const webview = useRef<WebView>(null);

  const [loadingProgress, setLoadingProgress] = useState(10);
  const [isFocus, setFocus] = useState(false);
  const [addr, setAddr] = useState('');
  const [uri, setUri] = useState<string>('');
  const addrRef = useRef<TextInput>(null);

  const onAddrSubmit = () => {
    if (!isURL(addr)) return;
    addr.toLowerCase().startsWith('http://') ? setUri(addr) : setUri(`http://${addr}`);
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
          defaultValue={isFocus ? addr : undefined}
          value={isFocus ? undefined : addr}
          onChangeText={(t) => setAddr(t)}
          onSubmitEditing={() => onAddrSubmit()}
          style={{
            backgroundColor: isFocus ? '#fff' : '#f5f5f5',
            fontSize: 17,
            paddingHorizontal: 15,
            flex: 1,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: isFocus ? borderColor : 'transparent',
            borderRadius: 7,
            textAlign: isFocus ? 'auto' : 'center',
          }}
        />

        {loadingProgress > 0 && loadingProgress < 100 ? (
          <View
            style={{
              height: 2,
              backgroundColor: Networks.current.color,
              position: 'absolute',
              bottom: 0,
              marginHorizontal: -16,
              width: `${loadingProgress}%`,
            }}
          />
        ) : undefined}
      </View>

      <WebView
        ref={webview}
        applicationNameForUserAgent={appName}
        source={{ uri }}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress * 100)}
        onLoadEnd={() => setLoadingProgress(100)}
      />
    </View>
  );
};
