import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/Transaction';

import Actions from './Actions';
import App from '../../viewmodels/App';
import Assets from './Assets';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { IToken } from '../../common/Tokens';
import { Modalize } from 'react-native-modalize';
import { NavigationContainer } from '@react-navigation/native';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import TokenDetail from './TokenDetail';
import TxDetail from './TxDetail';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useIsFocused } from '@react-navigation/native';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  DApps: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { t } = i18n;

  const { currentAccount } = App;
  const { current } = Networks;
  const { ref: tokenDetailModalize, open: openTokenDetail, close: closeTokenDetail } = useModalize();
  const { ref: txDetailModalize, open: openTxDetail, close: closeTxDetail } = useModalize();
  const [selectedToken, setSelectedToken] = useState<IToken>();
  const [selectedTx, setSelectedTx] = useState<Transaction>();
  const { backgroundColor, foregroundColor, statusBarStyle, isLightMode, mode } = Theme;

  const onTokenPress = (token: IToken) => {
    setSelectedToken(token);
    setTimeout(() => openTokenDetail(), 0);
  };

  const onTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setTimeout(() => openTxDetail(), 0);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingBottom: 0,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor,
      }}
    >
      <Overview
        mode={mode}
        style={{
          backgroundColor: isLightMode ? current.color : 'transparent',
          marginBottom: 2,
          borderWidth: isLightMode ? 0 : 1,
          borderColor: current.color,
        }}
        separatorColor={isLightMode ? undefined : current.color}
        textColor={isLightMode ? '#fff' : current.color}
        address={currentAccount?.address}
        balance={currentAccount?.balance}
        currency={CurrencyViewmodel.currentCurrency.symbol}
        network={current.network}
        chainId={current.chainId}
        avatar={currentAccount?.avatar}
        ens={currentAccount?.ens.name}
        connectedApps={WalletConnectV1ClientHub.connectedCount}
        disabled={currentAccount?.tokens.loadingTokens}
        onSendPress={() => PubSub.publish('openSendFundsModal')}
        onRequestPress={() => PubSub.publish('openRequestFundsModal')}
        onDAppsPress={() => navigation.navigate('DApps')}
      />

      <Assets
        tokens={currentAccount?.tokens.tokens}
        themeColor={current.color}
        loadingTokens={currentAccount?.tokens.loadingTokens}
        onRefreshRequest={async () => await App.refreshAccount()}
        onTokenPress={onTokenPress}
        onTxPress={onTxPress}
      />

      <StatusBar style={statusBarStyle} />

      <Portal>
        <Modalize
          adjustToContentHeight
          ref={tokenDetailModalize}
          snapPoint={500}
          modalStyle={{ borderTopStartRadius: 15, borderTopEndRadius: 15 }}
        >
          <TokenDetail
            token={selectedToken}
            network={current}
            themeColor={current.color}
            onSendPress={(token) => {
              PubSub.publish('openSendFundsModal', { token });
              closeTokenDetail();
            }}
          />
        </Modalize>

        <Modalize ref={txDetailModalize} adjustToContentHeight modalStyle={{ borderTopStartRadius: 5, borderTopEndRadius: 5 }}>
          <SafeAreaProvider>
            <TxDetail tx={selectedTx} />
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </View>
  );
});
