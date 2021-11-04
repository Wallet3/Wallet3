import Actions from './Actions';
import App from '../../viewmodels/App';
import Assets from './Assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import React from 'react';
import Request from '../../modals/Request';
import Send from '../../modals/Send';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { ref: sendModalizeRef, open: openSend, close } = useModalize();
  const { ref: requestModalizeRef, open: openRequest } = useModalize();
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
        onSendPress={openSend}
        onRequestPress={openRequest}
        themeColor={current.color}
      />

      <Portal>
        <Modalize
          ref={sendModalizeRef}
          adjustToContentHeight
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <Send />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          ref={requestModalizeRef}
          adjustToContentHeight
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <Request />
        </Modalize>
      </Portal>

      <StatusBar style="dark" />
    </View>
  );
});
