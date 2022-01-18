import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeViewContainer, Separator } from '../../components';

import { Account } from '../../viewmodels/account/Account';
import AccountItem from './AccountItem';
import App from '../../viewmodels/App';
import CachedImage from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import rootStyles from '../styles';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  onRemoveAccount?: (account: Account) => void;
  onEditAccount?: (account: Account) => void;
}

export default observer(({ onRemoveAccount, onEditAccount }: Props) => {
  const { t } = i18n;
  const themeColor = Networks.current.color;
  const list = useRef<FlatList>(null);

  const renderAccount = ({ item }: ListRenderItemInfo<Account>) => (
    <AccountItem
      account={item}
      themeColor={themeColor}
      onPress={() => App.switchAccount(item.address)}
      onEdit={onEditAccount}
      onRemove={onRemoveAccount}
    />
  );

  const newAccount = async () => {
    App.newAccount();
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 150);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        list.current?.scrollToIndex({ index: App.allAccounts.indexOf(App.currentAccount!), animated: true });
      } catch (error) {}
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <Text style={{ color: secondaryFontColor }} numberOfLines={1}>
        {t('modal-multi-accounts-title')}
      </Text>

      <Separator style={{ marginTop: 4, opacity: 0.5 }} />

      <FlatList
        ref={list}
        data={App.allAccounts}
        renderItem={renderAccount}
        keyExtractor={(i) => i.address}
        style={{ flex: 1, marginHorizontal: -16 }}
        contentContainerStyle={{ paddingVertical: 4 }}
      />

      <Separator style={{ marginBottom: 4, opacity: 0.5 }} />

      <TouchableOpacity style={styles.option} onPress={newAccount}>
        <MaterialIcons name="add-circle" size={22} color={themeColor} />
        <Text style={{ marginStart: 10, color: themeColor, fontWeight: '600', fontSize: 15 }}>Create a new account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Ionicons name="key-outline" size={19} color={themeColor} style={{ paddingHorizontal: 1.5 }} />
        <Text style={{ marginStart: 10, color: themeColor, fontWeight: '600', fontSize: 15 }}>Import an existing wallet</Text>
      </TouchableOpacity>
    </SafeViewContainer>
  );
});

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
