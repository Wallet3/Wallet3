import React, { useEffect } from 'react';

import Actions from './Actions';
import App from '../../viewmodels/App';
import Assets from './Assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { currentWallet } = App;
  const { current } = Networks;

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
      }}
    >
      <Overview
        style={{ marginBottom: 2, backgroundColor: current.color }}
        address={currentWallet?.currentAccount?.address}
        balance={currentWallet?.currentAccount?.balanceUSD}
        network={current.network}
      />

      <Assets
        tokens={currentWallet?.currentAccount?.tokens}
        themeColor={current.color}
        loadingTokens={currentWallet?.currentAccount?.loadingTokens}
      />

      <Actions
        style={{ marginTop: 8 }}
        disabled={currentWallet?.currentAccount?.loadingTokens}
        onSendPress={() => PubSub.publish('openSendModal')}
        onRequestPress={() => PubSub.publish('openRequestModal')}
        themeColor={current.color}
      />

      <StatusBar style="dark" />
    </View>
  );
});
