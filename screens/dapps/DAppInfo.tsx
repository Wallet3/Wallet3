import { Button, SafeViewContainer } from '../../components';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import { Entypo } from '@expo/vector-icons';
import { INetwork } from '../../common/Networks';
import Image from 'react-native-fast-image';
import { MetamaskDApp } from '../../viewmodels/walletconnect/MetamaskDApp';
import Networks from '../../viewmodels/core/Networks';
import React from 'react';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../../viewmodels/walletconnect/WalletConnect_v2';
import dayjs from 'dayjs';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { thirdFontColor } from '../../constants/styles';

interface Props {
  client: WalletConnect_v1 | WalletConnect_v2 | MetamaskDApp;
  defaultAccount?: Account;
  defaultNetwork?: INetwork;

  onDisconnect: () => void;
  onNetworkPress?: () => void;
  onAccountsPress?: () => void;
}

export default observer(({ client, onDisconnect, onNetworkPress, onAccountsPress, defaultAccount, defaultNetwork }: Props) => {
  const { appMeta } = client || {};
  const { t } = i18n;

  return (
    <SafeViewContainer>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, color: thirdFontColor }}>
        {t('connectedapps-modal-title')}
      </Text>

      <View style={viewStyles.infoItem}>
        <Text style={viewStyles.itemTxt}>DApp:</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 17, height: 17, marginEnd: 4, borderRadius: 2 }} />
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
            {appMeta?.url?.startsWith('http') ? appMeta?.url : `https://${appMeta?.url}`}
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
          <Avatar
            uri={defaultAccount?.avatar}
            size={15}
            emojiSize={8}
            emoji={defaultAccount?.emojiAvatar}
            backgroundColor={defaultAccount?.emojiColor}
          />

          <Text style={{ ...viewStyles.itemTxt, marginStart: 6 }} numberOfLines={1}>
            {defaultAccount?.miniDisplayName}
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
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {client.chains.map((c) => {
              const network = Networks.find(c) || {};
              return generateNetworkIcon({
                ...network,
                chainId: c,
                width: 15,
                height: 15,
                style: { marginHorizontal: 4 },
              });
            })}
          </ScrollView>

          <Text style={{ ...viewStyles.itemTxt, marginStart: 2, maxWidth: 100 }} numberOfLines={1}>
            {defaultNetwork?.network?.split(' ')[0]}
          </Text>

          <Entypo name="chevron-right" style={viewStyles.arrow} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Button title={t('connectedapps-modal-button-disconnect')} themeColor={'crimson'} onPress={onDisconnect} />
    </SafeViewContainer>
  );
});

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
