import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeViewContainer, Separator } from '../../components';

import { Account } from '../../viewmodels/account/Account';
import App from '../../viewmodels/App';
import CachedImage from 'react-native-expo-cached-image';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  account: Account;
  themeColor: string;
  onPress?: (item: Account) => void;
  onEdit?: (item: Account) => void;
  onRemove?: (item: Account) => void;
}

export default observer(({ account, themeColor, onPress, onEdit, onRemove }: Props) => {
  const balance = `${
    account.nativeToken.balance.gt(0) ? utils.formatEther(account.nativeToken.balance).substring(0, 6) : '0'
  } ${account.nativeToken.symbol}`;

  const { currentAccount } = App;
  const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;

    switch (index) {
      case 0:
        onEdit?.(account);
        break;
      case 1:
        onRemove?.(account);
        break;
    }
  };

  const actions =
    App.allAccounts.length > 1
      ? [
          { title: 'Edit', systemIcon: 'square.and.pencil' },
          { title: 'Remove', destructive: true, systemIcon: 'trash.slash' },
        ]
      : [{ title: 'Edit', systemIcon: 'square.and.pencil' }];

  return (
    <ContextMenu onPress={onActionPress} actions={actions}>
      <TouchableOpacity
        onPress={() => onPress?.(account)}
        style={{ flexDirection: 'row', paddingVertical: 8, alignItems: 'center', paddingHorizontal: 16 }}
      >
        {account.avatar ? (
          <CachedImage source={{ uri: account.avatar }} style={styles.avatar} />
        ) : (
          <View style={{ ...styles.avatar, backgroundColor: account.emojiColor }}>
            <Text style={{ fontSize: 17, textAlign: 'center', marginTop: 2, marginStart: 1.5 }}>{account.emojiAvatar}</Text>
          </View>
        )}

        <View style={{ flex: 1, marginStart: 12, justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '500',
              marginBottom: 2,
              color: account.address === currentAccount?.address ? themeColor : undefined,
            }}
            numberOfLines={1}
          >
            {account.displayName}
          </Text>
          <Text style={{ color: secondaryFontColor }}>{balance}</Text>
        </View>

        <Feather
          name="check"
          color={themeColor}
          size={20}
          style={{ opacity: account.address === currentAccount?.address ? 1 : 0 }}
        />
      </TouchableOpacity>
    </ContextMenu>
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
