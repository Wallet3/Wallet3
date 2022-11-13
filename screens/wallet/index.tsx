import React, { useEffect, useState } from 'react';

import AddressQRCode from './AddressQRCode';
import App from '../../viewmodels/core/App';
import Assets from './Assets';
import CurrencyViewmodel from '../../viewmodels/settings/Currency';
import { DrawerScreenProps } from '@react-navigation/drawer';
import GasPrice from '../../viewmodels/misc/GasPrice';
import { IToken } from '../../common/tokens';
import { InappBrowserModal } from '../Modalize';
import MessageKeys from '../../common/MessageKeys';
import { Modalize } from 'react-native-modalize';
import Networks from '../../viewmodels/core/Networks';
import Overview from './Overview';
import { Portal } from 'react-native-portalize';
import Theme from '../../viewmodels/settings/Theme';
import TokenDetail from './TokenDetail';
import Transaction from '../../models/Transaction';
import TxDetail from './TxDetail';
import { View } from 'react-native';
import WalletConnectV1ClientHub from '../../viewmodels/walletconnect/WalletConnectV1ClientHub';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  DApps: undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { currentAccount } = App;
  const { current } = Networks;
  const { ref: tokenDetailModalize, open: openTokenDetail, close: closeTokenDetail } = useModalize();
  const { ref: txDetailModalize, open: openTxDetail, close: closeTxDetail } = useModalize();
  const { ref: addressQRModalize, open: openAddressQR } = useModalize();
  const [selectedToken, setSelectedToken] = useState<IToken>();
  const [selectedTx, setSelectedTx] = useState<Transaction>();
  const { backgroundColor, isLightMode, mode } = Theme;

  const onTokenPress = (token: IToken) => {
    setSelectedToken(token);
    setTimeout(() => openTokenDetail(), 0);
  };

  const onTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setTimeout(() => openTxDetail(), 0);
  };

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openMyAddressQRCode, () => openAddressQR());

    return () => {
      PubSub.unsubscribe(MessageKeys.openMyAddressQRCode);
    };
  }, []);

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
        network={current}
        chainId={current.chainId}
        avatar={currentAccount?.avatar}
        ens={currentAccount?.ens.name}
        connectedApps={WalletConnectV1ClientHub.connectedCount}
        disabled={currentAccount?.tokens.loadingTokens}
        onSendPress={() => PubSub.publish(MessageKeys.openSendFundsModal)}
        onRequestPress={() => PubSub.publish(MessageKeys.openRequestFundsModal)}
        onDAppsPress={() => navigation.navigate('DApps')}
        gasPrice={GasPrice.currentGwei}
        onQRCodePress={() => openAddressQR()}
        signInPlatform={currentAccount?.signInPlatform}
      />

      <Assets
        tokens={currentAccount?.tokens.tokens}
        themeColor={current.color}
        loadingTokens={currentAccount?.tokens.loadingTokens}
        onRefreshRequest={async () => await App.refreshAccount()}
        onTokenPress={onTokenPress}
        onTxPress={onTxPress}
        network={current}
      />

      <Portal>
        <Modalize
          adjustToContentHeight
          ref={tokenDetailModalize}
          snapPoint={500}
          modalStyle={{ borderTopStartRadius: 16, borderTopEndRadius: 16 }}
        >
          <TokenDetail
            token={selectedToken}
            network={current}
            themeColor={current.color}
            onSendPress={(token) => {
              PubSub.publish(MessageKeys.openSendFundsModal, { token });
              closeTokenDetail();
            }}
          />
        </Modalize>

        <Modalize
          ref={txDetailModalize}
          adjustToContentHeight
          snapPoint={500}
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
        >
          <TxDetail tx={selectedTx} close={closeTxDetail} />
        </Modalize>

        <Modalize
          ref={addressQRModalize}
          adjustToContentHeight
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
        >
          <AddressQRCode account={currentAccount || undefined} />
        </Modalize>

        <InappBrowserModal pageKey="wallet" />
      </Portal>
    </View>
  );
});
