import { AccountBase, AccountType } from '../../viewmodels/account/AccountBase';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Loader, SafeViewContainer, Separator } from '../../components';
import React, { useEffect, useRef, useState } from 'react';

import AccountItem from './AccountItem';
import App from '../../viewmodels/core/App';
import DeviceInfo from 'react-native-device-info';
import Networks from '../../viewmodels/core/Networks';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

interface Props {
  onRemoveAccount?: (account: AccountBase) => void;
  onEditAccount?: (account: AccountBase) => void;
  onImportWallet?: () => void;
  onDone?: () => void;
}

export default observer(({ onRemoveAccount, onEditAccount, onImportWallet, onDone }: Props) => {
  const { t } = i18n;
  const { current } = Networks;
  const { borderColor, textColor, backgroundColor,tintColor } = Theme;

  const list = useRef<FlatList>(null);
  const [busy, setBusy] = useState(false);
  const [isERC4337Version] = useState(DeviceInfo.getVersion().startsWith('4.337'));

  const renderAccount = ({ item }: ListRenderItemInfo<AccountBase>) => (
    <AccountItem
      account={item}
      currentNetwork={current}
      textColor={textColor}
      themeColor={tintColor}
      onEdit={onEditAccount}
      onRemove={onRemoveAccount}
      previewBackgroundColor={backgroundColor}
      onPress={() => {
        App.switchAccount(item.address);
        onDone?.();
      }}
    />
  );

  const newAccount = async (type: AccountType) => {
    await App.newAccount(type, (busy) => setBusy(busy));

    const index = App.allAccounts.findIndex((a) => a === App.currentAccount);
    index >= 5 && setTimeout(() => list.current?.scrollToIndex({ index, animated: true }), 100);
  };

  useEffect(() => {
    const { allAccounts } = App;
    if (allAccounts.length < 5 || !App.currentAccount) return;

    const index = allAccounts.indexOf(App.currentAccount);
    if (index < 5) return;

    const timer = setTimeout(() => {
      try {
        list.current?.scrollToIndex({ index, animated: true });
      } catch (error) {}
    }, Math.min(allAccounts.length * 100, 1000));

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <Text style={{ color: secondaryFontColor }} numberOfLines={1}>
        {t('modal-multi-accounts-title')}
      </Text>

      <Separator style={{ marginTop: 4, opacity: 0.5, backgroundColor: borderColor }} />

      <FlatList
        ref={list}
        data={App.allAccounts}
        renderItem={renderAccount}
        initialNumToRender={20}
        keyExtractor={(i) => i.address}
        style={{ flex: 1, marginHorizontal: -16 }}
        contentContainerStyle={{ paddingVertical: 4 }}
        onScrollToIndexFailed={({ index }) => setTimeout(() => list.current?.scrollToIndex({ index }), 200)}
      />

      <Separator style={{ marginBottom: 4, opacity: 0.5, backgroundColor: borderColor }} />

      {__DEV__ || isERC4337Version ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="add-circle" size={22} color={tintColor} />

          <TouchableOpacity style={styles.option} onPress={() => newAccount('eoa')}>
            <Text style={[{ marginStart: 10, color: tintColor }, styles.txt]}>
              {t('modal-multi-accounts-button-create-account')}
            </Text>
          </TouchableOpacity>

          {current.erc4337 && <Text style={[{ marginStart: 6, color: tintColor, marginEnd: 8 }, styles.txt]}>/</Text>}

          {current.erc4337 && (
            <TouchableOpacity style={styles.option} onPress={() => newAccount('erc4337')}>
              <Text style={[{ color: tintColor }, styles.txt]}>{t('modal-multi-accounts-button-super-account')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.option} onPress={() => newAccount('eoa')}>
          <MaterialIcons name="add-circle" size={22} color={tintColor} />
          <Text style={{ marginStart: 10, color: tintColor, fontWeight: '600', fontSize: 15 }}>
            {t('modal-multi-accounts-button-create-account')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.option} onPress={onImportWallet}>
        <Ionicons name="key-outline" size={19} color={tintColor} style={{ paddingHorizontal: 1.5 }} />
        <Text style={[{ marginStart: 10, color: tintColor }, styles.txt]}>
          {t('modal-multi-accounts-button-import-account')}
        </Text>
      </TouchableOpacity>

      <Loader loading={busy} message={t('msg-data-loading')} />
    </SafeViewContainer>
  );
});

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  txt: {
    fontWeight: '600',
    fontSize: 15,
  },
});
