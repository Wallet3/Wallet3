import App from '../../viewmodels/App';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default () => {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { currentWallet } = App;
  const { currentAccount } = currentWallet || {};

  return (
    <View>
      <View style={{ paddingTop: top + headerHeight, width: '100%', backgroundColor: 'dodgerblue' }}>
        <Image />
      </View>

      <StatusBar style='light' />
    </View>
  );
};
