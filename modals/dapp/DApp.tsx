import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { themeColor, thirdFontColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import Image from 'react-native-expo-cached-image';
import { Networks } from '../../common/Networks';
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
      <SafeViewContainer style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}
            onPress={onAccountsPress}
          >
            {account?.avatar ? (
              <Image source={{ uri: account.avatar }} style={{ width: 16, height: 16, marginEnd: 6, borderRadius: 100 }} />
            ) : undefined}

            <Text style={{ color: thirdFontColor, maxWidth: 150 }}>
              {account?.ens.name || formatAddress(client.accounts[0], 6, 5)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNetworksPress}
            disabled={client.version > 1}
            style={{
              padding: 6,
              paddingHorizontal: 12,
              borderColor: `${network.color}90`,
              borderWidth: 1,
              borderRadius: 100,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {generateNetworkIcon({ chainId: network.chainId, width: 16, height: 16, color: network.color })}
            <Text style={{ color: network.color, marginStart: 6 }}>{`${network.network}`}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <Image source={{ uri: app.icons[0] }} style={{ width: 72, height: 72, marginBottom: 12 }} />

        <Text style={{ ...viewStyles.txt, fontSize: 24, fontWeight: '500', opacity: 1 }}>{app.name}</Text>

        <Text style={viewStyles.txt} numberOfLines={1}>
          {app.url}
        </Text>

        {app.description ? (
          <Text style={viewStyles.txt} numberOfLines={2}>
            {app.description}
          </Text>
        ) : undefined}

        <View style={{ flex: 1 }} />

        <View style={{ width: '100%' }}>
          <Button title={t('button-connect')} onPress={onConnect} />
          <Button title={t('button-reject')} themeColor={themeColor} onPress={reject} style={{ marginTop: 12 }} reverse />
        </View>
      </SafeViewContainer>
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
