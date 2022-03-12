import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import Browser from '../screens/browser/Browser';
import MessageKeys from '../common/MessageKeys';
import React from 'react';
import { ReactiveScreen } from '../utils/device';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

interface Props {
  initUrl: string;
  onClose?: () => void;
}

export default observer(({ initUrl, onClose }: Props) => {
  const { width, height } = ReactiveScreen;
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: bottom, width, height }}>
      <Browser disableExtraFuncs singlePage pageId={Date.now()} initUrl={initUrl} onHome={onClose} onNewTab={onClose} />
    </View>
  );
});

export function openInappBrowser(url: string) {
  PubSub.publish(MessageKeys.openInappBrowser, { initUrl: url });
}
