import { Button, SafeViewContainer } from '../../components';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import { Feather } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    accounts,
    selectedAccounts,
    onDone,
    single,
  }: {
    accounts: Account[];
    selectedAccounts: string[];
    onDone: (selectedAccounts: string[]) => void;
    single?: boolean;
  }) => {
    const [selected, setSelected] = useState(selectedAccounts);
    const { t } = i18n;

    const toggleNetwork = (account: string) => {
      if (single) {
        setSelected([account]);
        onDone([account]);
        return;
      }

      if (selected.includes(account)) {
        if (selected.length === 1) return;
        setSelected(selected.filter((id) => id !== account));
      } else {
        setSelected([...selected, account]);
      }
    };

    const renderItem = ({ item }: { item: Account }) => {
      return (
        <TouchableOpacity
          onPress={() => toggleNetwork(item.address)}
          style={{
            flexDirection: 'row',
            padding: 4,
            alignItems: 'center',
            paddingVertical: 12,
            flex: 1,
          }}
        >
          <Feather
            name="check"
            color={themeColor}
            size={16}
            style={{ opacity: selected.includes(item.address) ? 1 : 0, marginBottom: -1 }}
          />

          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={{ width: 16, height: 16, marginStart: 12, borderRadius: 100 }} />
          ) : undefined}

          <Text
            style={{
              color: selected.includes(item.address) ? themeColor : fontColor,
              fontSize: 17,
              fontWeight: '500',
              marginStart: 10,
            }}
            numberOfLines={1}
          >
            {item.ens.name || formatAddress(item.address)}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <SafeViewContainer style={{ flex: 1 }}>
        <View style={{ borderBottomColor: borderColor, borderBottomWidth: 1, paddingBottom: 2 }}>
          <Text style={{ color: secondaryFontColor }}>{t('modal-accounts-selector-title')}:</Text>
        </View>

        <FlatList
          data={accounts}
          renderItem={renderItem}
          keyExtractor={(i) => i}
          contentContainerStyle={{ paddingBottom: 8 }}
          style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 12 }}
        />

        <Button title={t('button-done')} disabled={selected.length === 0} onPress={() => onDone(selected)} />
      </SafeViewContainer>
    );
  }
);
