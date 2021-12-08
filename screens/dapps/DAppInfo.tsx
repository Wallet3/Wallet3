import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import { Entypo } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import { PublicNetworks } from '../../common/Networks';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import dayjs from 'dayjs';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { thirdFontColor } from '../../constants/styles';

interface Props {
  client: WalletConnect_v1;
  accounts: Account[];
  onDisconnect: () => void;
  onNetworkPress?: () => void;
  onAccountsPress?: () => void;
}

export default ({ client, accounts, onDisconnect, onNetworkPress, onAccountsPress }: Props) => {
  const { appMeta, enabledChains } = client || {};
  const { t } = i18n;

  const defaultAccount = accounts.find((a) => a.address === client.accounts[0]);
  const defaultNetwork = client.findTargetNetwork({ networks: PublicNetworks, defaultNetwork: Networks.current });

  return (
    <SafeViewContainer>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, color: thirdFontColor }}>
        {t('connectedapps-modal-title')}
      </Text>
      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>DApp:</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 17, height: 17, marginEnd: 4 }} />
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {appMeta?.name}
          </Text>
        </View>
      </View>
      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>{t('connectedapps-modal-description')}:</Text>
        <Text style={viewStyles.itemTxt} numberOfLines={1}>
          {appMeta?.description || 'No Description'}
        </Text>
      </View>
      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>URL:</Text>
        <TouchableOpacity>
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {appMeta?.url}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>{t('connectedapps-modal-last-used')}:</Text>
        <Text style={viewStyles.itemTxt} numberOfLines={1}>
          {dayjs(client.lastUsedTimestamp).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      </View>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>{t('connectedapps-modal-accounts')}:</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onAccountsPress}>
          {defaultAccount?.avatar ? (
            <Image
              source={{ uri: defaultAccount.avatar }}
              style={{ width: 15, height: 15, borderRadius: 100, marginEnd: 4 }}
            />
          ) : undefined}
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {defaultAccount?.ens.name || formatAddress(defaultAccount?.address ?? '', 7, 5)}
          </Text>
          <Entypo name="chevron-right" style={viewStyles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>{t('connectedapps-modal-networks')}:</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onNetworkPress}>
          <ScrollView
            horizontal
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: 'row-reverse', maxWidth: 185 }}
          >
            {enabledChains.map((c) =>
              generateNetworkIcon({ chainId: c, width: 15, height: 15, style: { marginHorizontal: 4 } })
            )}
          </ScrollView>

          {enabledChains.length === 1 ? (
            <Text style={{ ...viewStyles.itemTxt, marginStart: 2 }} numberOfLines={1}>
              {defaultNetwork.network}
            </Text>
          ) : undefined}

          <Entypo name="chevron-right" style={viewStyles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Button title={t('connectedapps-modal-button-disconnect')} themeColor={'crimson'} onPress={onDisconnect} />
    </SafeViewContainer>
  );
};

const viewStyles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderBottomColor: '#75869c10',
  },

  itemTxt: {
    color: thirdFontColor,
    fontSize: 15,
    maxWidth: 200,
  },

  arrow: { color: thirdFontColor, marginStart: 4, opacity: 0.5 },
});
