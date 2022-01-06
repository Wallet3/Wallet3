import { Button, SafeViewContainer } from '../../components';
import { INetwork, Networks } from '../../common/Networks';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { themeColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import DAppConnectView from '../views/DAppConnectView';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

interface DAppProps {
  client: WalletConnect_v1;
  onNetworksPress?: () => void;
  onAccountsPress?: () => void;
  close: Function;
  onConnect: () => void;
  accounts: Account[];
  currentAccount?: Account;
}

export default observer(
  ({ client, onNetworksPress, onAccountsPress, close, onConnect, accounts, currentAccount }: DAppProps) => {
    const { t } = i18n;
    const networks = Networks.filter((n) => client.enabledChains.includes(n.chainId));
    const [network] = networks;

    const app = client.appMeta!;

    const account = client.accounts.includes(currentAccount?.address ?? '')
      ? currentAccount
      : accounts.find((a) => a.address === client.accounts[0]) ?? currentAccount;

    const reject = async () => {
      close();
      await client.killSession();
      client.dispose();
    };

    if (!network) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ color: 'crimson', fontSize: 24 }}>{t('modal-dapp-not-supported-network')}</Text>
          </View>
          <Button title="Close" onPress={() => close()} />
        </View>
      );
    }

    return (
      <DAppConnectView
        network={network}
        account={account}
        appDesc={app.description}
        appIcon={app.icons[0]}
        appName={app.name}
        appUrl={app.url}
        disableNetworksButton={client.version > 1}
        onAccountsPress={onAccountsPress}
        onNetworksPress={onNetworksPress}
        onConnect={onConnect}
        onReject={reject}
      />
    );
  }
);

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    opacity: 0.75,
    fontSize: 17,
    maxWidth: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
});
