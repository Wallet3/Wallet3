import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Transaction, { ITransaction } from '../../models/Transaction';
import { secondaryFontColor, thirdFontColor } from '../../constants/styles';

import Actions from './Actions';
import AnimateNumber from 'react-native-animate-number';
import App from '../../viewmodels/App';
import Assets from './Assets';
import Avatar from '../../components/Avatar';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { IToken } from '../../common/Tokens';
import { Modalize } from 'react-native-modalize';
import { NavigationContainer } from '@react-navigation/native';
import Networks from '../../viewmodels/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import { StatusBar } from 'expo-status-bar';
import TokenDetail from './TokenDetail';
import TxDetail from './TxDetail';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { formatCurrency } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useIsFocused } from '@react-navigation/native';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { top } = useSafeAreaInsets();

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
        paddingTop: top,
        paddingBottom: 0,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          padding: 8,
          paddingStart: 6,
          paddingEnd: 4,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: '500', color: 'lightgrey' }}>Good morning</Text>
          <Text style={{ fontSize: 24, fontWeight: '600', color: current.color, marginTop: 4 }} numberOfLines={1}>
            {currentAccount?.displayName}
          </Text>
        </View>

        <Avatar
          size={52}
          uri={currentAccount?.avatar}
          emoji={currentAccount?.emojiAvatar}
          backgroundColor={currentAccount?.emojiColor}
          emojiSize={20}
        />
      </View>

      <View style={{ marginTop: 8, padding: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, color: 'lightgrey', fontWeight: '500' }}>Balance</Text>
        </View>

        <AnimateNumber
          value={currentAccount?.balance || 0}
          style={{ color: current.color, fontWeight: '600', maxWidth: '85%', fontSize: 29, textAlignVertical: 'bottom' }}
          numberOfLines={1}
          formatter={(v) => formatCurrency(v, CurrencyViewmodel.currentCurrency.symbol)}
        />
      </View>

      {/* <Assets
        tokens={currentAccount?.tokens.tokens}
        themeColor={current.color}
        loadingTokens={currentAccount?.tokens.loadingTokens}
        onRefreshRequest={async () => await App.refreshAccount()}
        onTokenPress={onTokenPress}
        onTxPress={onTxPress}
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