import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/Account';
import { Entypo } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import { PublicNetworks } from '../../common/Networks';
import React, {  } from 'react';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { thirdFontColor } from '../../constants/styles';

export default ({
  client,
  accounts,
  onDisconnect,
  onNetworkPress,
  onAccountsPress,
}: {
  client: WalletConnect_v1;
  accounts: Account[];
  onDisconnect: () => void;
  onNetworkPress?: () => void;
  onAccountsPress?: () => void;
}) => {
  const { appMeta } = client || {};

  const defaultAccount = accounts.find((a) => a.address === client.accounts[0]);
  const defaultNetwork = client.findTargetNetwork({ networks: PublicNetworks, defaultNetwork: Networks.current });

  return (
    <SafeViewContainer>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, color: thirdFontColor }}>DApp Info</Text>
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
        <Text style={viewStyles.itemTxt}>Description:</Text>
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
        <Text style={viewStyles.itemTxt}>Last used:</Text>
        <Text style={viewStyles.itemTxt} numberOfLines={1}>
          {client.lastUsedTimestamp.toLocaleString(undefined, {})}
        </Text>
      </View>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>Accounts:</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onAccountsPress}>
          {defaultAccount?.avatar ? (
            <Image
              source={{ uri: defaultAccount.avatar }}
              style={{ width: 15, height: 15, borderRadius: 100, marginEnd: 4 }}
            />
          ) : undefined}
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {defaultAccount?.ensName || formatAddress(defaultAccount?.address ?? '', 7, 5)}
          </Text>
          <Entypo name="chevron-right" style={viewStyles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>Networks:</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onNetworkPress}>
          {generateNetworkIcon({ chainId: defaultNetwork.chainId, width: 15, height: 15, style: { marginHorizontal: 4 } })}
          <Text style={viewStyles.itemTxt} numberOfLines={1}>
            {defaultNetwork.network}
          </Text>

          <Entypo name="chevron-right" style={viewStyles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Button title="Disconnect" themeColor={'crimson'} onPress={onDisconnect} />
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
