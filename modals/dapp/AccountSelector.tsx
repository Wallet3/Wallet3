import { Button, SafeViewContainer } from '../../components';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import { inactivatedColor, secondaryFontColor } from '../../constants/styles';

import { AccountBase } from '../../viewmodels/account/AccountBase';
import Avatar from '../../components/Avatar';
import { ERC4337Account } from '../../viewmodels/account/ERC4337Account';
import { INetwork } from '../../common/Networks';
import SuperBadge from '../../components/SuperBadge';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  accounts: AccountBase[];
  selectedAccounts: string[];
  onDone: (selectedAccounts: string[]) => void;
  single?: boolean;
  style?: StyleProp<ViewStyle>;
  expanded?: boolean;
  network?: INetwork;
}

export default observer(({ accounts, selectedAccounts, onDone, single, style, expanded, network }: Props) => {
  const [selected, setSelected] = useState(selectedAccounts);
  const { t } = i18n;
  const { borderColor, textColor } = Theme;
  const themeColor = network?.color;

  const toggleAddress = (account: string) => {
    if (single || expanded) {
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

  const renderItem = ({ item }: { item: AccountBase }) => {
    return (
      <TouchableOpacity
        onPress={() => toggleAddress(item.address)}
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

        <Avatar
          size={32}
          uri={item.avatar}
          emoji={item.emojiAvatar}
          backgroundColor={item.emojiColor}
          emojiSize={12}
          style={{ marginStart: 12 }}
        />

        <Text
          style={{
            color: selected.includes(item.address) ? themeColor : textColor,
            fontSize: 17,
            fontWeight: '500',
            marginStart: 10,
            maxWidth: '80%',
          }}
          numberOfLines={1}
        >
          {item.displayName}
        </Text>

        {item.isERC4337 && (
          <SuperBadge
            containerStyle={{
              marginStart: 8,
              borderRadius: 5,
              paddingStart: 7,
              paddingVertical: 2,
              paddingEnd: 3,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: (item as ERC4337Account).activatedChains.get(network?.chainId || 0)
                ? themeColor
                : inactivatedColor,
            }}
            txtStyle={{ textTransform: 'uppercase', color: '#fff', fontSize: 10 }}
            iconColor="#fff"
            iconStyle={{ marginStart: 2 }}
            iconSize={11}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ flex: 1, ...(style || ({} as any)) }}>
      <View style={{ borderBottomColor: borderColor, borderBottomWidth: 1, paddingBottom: 2 }}>
        <Text style={{ color: secondaryFontColor }}>{t('modal-accounts-selector-title')}:</Text>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderItem}
        keyExtractor={(i) => i.address}
        initialNumToRender={20}
        contentContainerStyle={{ paddingBottom: expanded ? 36 : 8 }}
        style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16, marginBottom: expanded ? -36 : 12 }}
      />

      {expanded ? undefined : (
        <Button
          title={t('button-done')}
          disabled={selected.length === 0}
          onPress={() => onDone(selected)}
          themeColor={themeColor}
        />
      )}
    </SafeViewContainer>
  );
});
