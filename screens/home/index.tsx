import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/Transaction';

import Actions from './Actions';
import App from '../../viewmodels/App';
import Assets from './Assets';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import DAppHub from '../../viewmodels/hubs/DAppHub';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { IToken } from '../../common/Tokens';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import { StatusBar } from 'expo-status-bar';
import TokenDetail from './TokenDetail';
import TxDetail from './TxDetail';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { t } = i18n;
  const { currentWallet } = App;
  const { current } = Networks;
  const { ref: tokenDetailModalize, open: openTokenDetail, close: closeTokenDetail } = useModalize();
  const { ref: txDetailModalize, open: openTxDetail, close: closeTxDetail } = useModalize();
  const [selectedToken, setSelectedToken] = useState<IToken>();
  const [selectedTx, setSelectedTx] = useState<Transaction>();

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
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
      }}
    >
      <Overview
        style={{ backgroundColor: current.color, marginBottom: 2 }}
        address={currentWallet?.currentAccount?.address}
        balance={currentWallet?.currentAccount?.balance}
        currency={CurrencyViewmodel.currentCurrency.symbol}
        network={current.network}
        chainId={current.chainId}
        avatar={currentWallet?.currentAccount?.avatar}
        ens={currentWallet?.currentAccount?.ens.name}
        connectedApps={DAppHub.connectedCount}
        disabled={currentWallet?.currentAccount?.tokens.loadingTokens}
        onSendPress={() => PubSub.publish('openSendFundsModal')}
        onRequestPress={() => PubSub.publish('openRequestFundsModal')}
      />

      <Assets
        tokens={currentWallet?.currentAccount?.tokens.tokens}
        themeColor={current.color}
        loadingTokens={currentWallet?.currentAccount?.tokens.loadingTokens}
        onRefreshRequest={async () => await currentWallet?.refreshAccount()}
        onTokenPress={onTokenPress}
        onTxPress={onTxPress}
      />

      {/* <Actions
        style={{ marginTop: 8 }}
        disabled={currentWallet?.currentAccount?.tokens.loadingTokens}
        onSendPress={() => PubSub.publish('openSendFundsModal')}
        onRequestPress={() => PubSub.publish('openRequestFundsModal')}
        themeColor={current.color}
      /> */}

      <StatusBar style="dark" />

      <Portal>
        <Modalize
          adjustToContentHeight
          ref={tokenDetailModalize}
          snapPoint={450}
          modalStyle={{ borderTopStartRadius: 15, borderTopEndRadius: 15 }}
        >
          <TokenDetail
            token={selectedToken}
            themeColor={current.color}
            onSendPress={(token) => {
              PubSub.publish('openSendFundsModal', { token });
              closeTokenDetail();
            }}
          />
        </Modalize>

        <Modalize ref={txDetailModalize} adjustToContentHeight modalStyle={{ borderTopStartRadius: 5, borderTopEndRadius: 5 }}>
          <TxDetail tx={selectedTx} />
        </Modalize>
      </Portal>
    </View>
  );
});
