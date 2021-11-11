import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import Actions from './Actions';
import App from '../../viewmodels/App';
import Assets from './Assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { IToken } from '../../common/Tokens';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import { StatusBar } from 'expo-status-bar';
import TokenDetail from './TokenDetail';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { currentWallet } = App;
  const { current } = Networks;
  const { ref: tokenDetailModalize, open, close: closeTokenDetail } = useModalize();
  const [selectedToken, setSelectedToken] = useState<IToken | undefined>(undefined);

  const onTokenPress = (token: IToken) => {
    setSelectedToken(token);
    setTimeout(() => open(), 0);
  };

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
        onRefreshRequest={async () => await currentWallet?.refreshAccount()}
        onTokenPress={onTokenPress}
      />

      <Actions
        style={{ marginTop: 8 }}
        disabled={currentWallet?.currentAccount?.loadingTokens}
        onSendPress={() => PubSub.publish('openSendModal')}
        onRequestPress={() => PubSub.publish('openRequestModal')}
        themeColor={current.color}
      />

      <StatusBar style="dark" />

      <Portal>
        <Modalize
          adjustToContentHeight
          ref={tokenDetailModalize}
          snapPoint={450}
          modalStyle={{ borderTopStartRadius: 25, borderTopEndRadius: 25 }}
        >
          <TokenDetail
            token={selectedToken}
            themeColor={current.color}
            onSendPress={(token) => {
              PubSub.publish('openSendModal', { token });
              closeTokenDetail();
            }}
          />
        </Modalize>
      </Portal>
    </View>
  );
});
