import Browser from '../screens/browser/Browser';
import MessageKeys from '../common/MessageKeys';
import React from 'react';
import { ReactiveScreen } from '../utils/device';
import Theme from '../viewmodels/settings/Theme';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  initUrl: string;
  onClose?: () => void;
}

export default observer(({ initUrl, onClose }: Props) => {
  const { width, height } = ReactiveScreen;
  const { backgroundColor, systemBorderColor } = Theme;
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor, width, height }}>
      <Browser disableExtraFuncs singlePage pageId={Date.now()} initUrl={initUrl} onHome={onClose} onNewTab={onClose} />
      {bottom > 0 && (
        <View
          style={{
            height: bottom,
            width: '100%',
            borderTopColor: systemBorderColor,
            borderTopWidth: 0.333,
          }}
        />
      )}
    </View>
  );
});

export function openInappBrowser(url: string) {
  PubSub.publish(MessageKeys.openInappBrowser, { initUrl: url });
}
