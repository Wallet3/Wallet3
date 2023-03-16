import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Feather, FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeSyntheticEvent, Text, TouchableOpacity, View } from 'react-native';
import { inactivatedColor, secondaryFontColor } from '../../constants/styles';

import { AccountBase } from '../../viewmodels/account/AccountBase';
import App from '../../viewmodels/core/App';
import Avatar from '../../components/Avatar';
import { ERC4337Account } from '../../viewmodels/account/ERC4337Account';
import { INetwork } from '../../common/Networks';
import { Placeholder } from '../../components';
import React from 'react';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

interface Props {
  account: AccountBase;
  currentNetwork: INetwork;
  themeColor: string;
  onPress?: (item: AccountBase) => void;
  onEdit?: (item: AccountBase) => void;
  onRemove?: (item: AccountBase) => void;
  textColor: string;
  previewBackgroundColor: string;
}

export default observer(
  ({ account, themeColor, onPress, onEdit, onRemove, textColor, previewBackgroundColor, currentNetwork }: Props) => {
    const balance = `${
      account.nativeToken.balance.gt(0) ? utils.formatEther(account.nativeToken.balance).substring(0, 6) : '0'
    } ${account.nativeToken.symbol}`;

    const { currentAccount } = App;
    const { t } = i18n;

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
      <ContextMenu onPress={onActionPress} actions={actions} previewBackgroundColor={previewBackgroundColor}>
        <TouchableOpacity
          onPress={() => onPress?.(account)}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

              {account.isERC4337 && (
                <View
                  style={{
                    marginStart: 8,
                    borderRadius: 5,
                    paddingStart: 8,
                    paddingEnd: 5,
                    paddingVertical: 2,
                    marginTop: -2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: (account as ERC4337Account).activatedChains.get(currentNetwork.chainId)
                      ? themeColor
                      : inactivatedColor,
                  }}
                >
                  <Text style={{ textTransform: 'uppercase', color: '#fff', fontSize: 10, fontWeight: '700' }}>Super</Text>
                  <MaterialCommunityIcons name="lightning-bolt" color="#fff" style={{ marginStart: 5 }} size={12} />
                </View>
              )}
            </View>
            <Placeholder />
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
  }
);
