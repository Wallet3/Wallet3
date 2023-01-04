import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { NativeSyntheticEvent, Text, View, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import App from '../../viewmodels/core/App';
import Avatar from '../../components/Avatar';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  account: Account;
  themeColor: string;
  onPress?: (item: Account) => void;
  onEdit?: (item: Account) => void;
  onRemove?: (item: Account) => void;
  textColor: string;
  previewBackgroundColor: string;
}

export default observer(({ account, themeColor, onPress, onEdit, onRemove, textColor, previewBackgroundColor }: Props) => {
  const balance = `${
    account.nativeToken.balance.gt(0) ? utils.formatEther(account.nativeToken.balance).substring(0, 6) : '0'
  } ${account.nativeToken.symbol}`;

  const { currentAccount } = App;
  const { t } = i18n;
  const [menuOpened, setMenuOpened] = useState(false);

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

  const actions: any[] =
    App.allAccounts.length > 1
      ? [
          { title: t('button-edit'), systemIcon: 'square.and.pencil' },
          { title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' },
        ]
      : [{ title: t('button-edit'), systemIcon: 'square.and.pencil' }];

  return (
    <ContextMenu
      onCancel={() => {
        setMenuOpened(false);
      }}
      onPress={onActionPress}
      actions={actions}
      previewBackgroundColor={previewBackgroundColor}
    >
      <TouchableOpacity
        onLongPress={() => {
          setMenuOpened(true);
        }}
        onPress={() => {
          if (!menuOpened) {
            onPress?.(account);
          }
        }}
        style={{ flexDirection: 'row', paddingVertical: 8, alignItems: 'center', paddingHorizontal: 16 }}
      >
        <Avatar
          size={42}
          uri={account.avatar}
          emojiSize={17}
          emoji={account.emojiAvatar}
          backgroundColor={account.emojiColor}
        />

        <View style={{ flex: 1, marginStart: 12, justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '500',
              marginBottom: 2,
              color: account.address === currentAccount?.address ? themeColor : textColor,
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
