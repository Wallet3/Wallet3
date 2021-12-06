import { StatusBar as RNStatusBar, View } from 'react-native';
import React, { useEffect } from 'react';

import App from '../../viewmodels/App';
import Image from 'react-native-expo-cached-image';
import { StatusBar } from 'expo-status-bar';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default () => {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { currentWallet } = App;
  const { currentAccount } = currentWallet || {};

  useEffect(() => {
    return () => {
      RNStatusBar.setBarStyle('dark-content');
    };
  }, []);

  return (
    <View>
      <View style={{ paddingTop: top + headerHeight, width: '100%', backgroundColor: 'dodgerblue' }}>
        <Image />
      </View>

    </View>
  );
};
