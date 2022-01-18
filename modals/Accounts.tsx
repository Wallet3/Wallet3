import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { FlatList, Image, ListRenderItemInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeViewContainer, Separator } from '../components';

import { Account } from '../viewmodels/account/Account';
import App from '../viewmodels/App';
import CachedImage from 'react-native-expo-cached-image';
import Currency from '../viewmodels/settings/Currency';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import rootStyles from './styles';
import { secondaryFontColor } from '../constants/styles';
import { utils } from 'ethers';

const AccountItem = observer(({ account, themeColor }: { account: Account; themeColor: string }) => {
  const balance = `${
    account.nativeToken.balance.gt(0) ? utils.formatEther(account.nativeToken.balance).substring(0, 6) : '0'
  } ${account.nativeToken.symbol}`;

  return (
    <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: 6, alignItems: 'center' }}>
      {account.avatar ? (
        <CachedImage source={{ uri: account.avatar }} style={styles.avatar} />
      ) : (
        <View style={{ ...styles.avatar, backgroundColor: account.emojiColor }}>
          <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 2, marginStart: 2 }}>{account.emojiAvatar}</Text>
        </View>
      )}

      <View style={{ flex: 1, marginStart: 12, justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 17, fontWeight: '500', marginBottom: 2 }}>{account.displayName}</Text>
        <Text style={{ color: secondaryFontColor }}>{balance}</Text>
      </View>

      <Feather name="check" color={themeColor} size={20} style={{ opacity: 1 }} />
    </TouchableOpacity>
  );
});

export default observer((props) => {
  const { t } = i18n;
  const themeColor = Networks.current.color;

  const renderAccount = ({ item }: ListRenderItemInfo<Account>) => <AccountItem account={item} themeColor={themeColor} />;

  return (
    <SafeAreaProvider style={rootStyles.safeArea}>
      <SafeViewContainer style={{ padding: 16 }}>
        <Text style={{ color: secondaryFontColor }} numberOfLines={1}>
          {t('modal-accounts-menu-title')}
        </Text>

        <Separator style={{ marginTop: 4 }} />

        <FlatList
          data={App.allAccounts}
          renderItem={renderAccount}
          keyExtractor={(i) => i.address}
          style={{ flex: 1, marginHorizontal: -16 }}
          contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 16 }}
        />

        <TouchableOpacity style={styles.option}>
          <MaterialIcons name="add-circle" size={22} color={themeColor} />
          <Text style={{ marginStart: 10, color: themeColor, fontWeight: '600', fontSize: 15 }}>Create a new account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="key-outline" size={19} color={themeColor} style={{ paddingHorizontal: 1.5 }} />
          <Text style={{ marginStart: 10, color: themeColor, fontWeight: '600', fontSize: 15 }}>
            Import an existing wallet
          </Text>
        </TouchableOpacity>
      </SafeViewContainer>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9375a7',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
