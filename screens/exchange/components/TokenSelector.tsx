import { Coin, Separator, TextBox } from '../../../components';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

import { IToken } from '../../../common/tokens';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

interface Props {
  tokens: IToken[];
  onTokenSelected?: (token: IToken) => void;
}

export default observer((props: Props) => {
  const { textColor, borderColor, secondaryTextColor } = Theme;

  const renderItem = ({ item }: ListRenderItemInfo<IToken>) => {
    return (
      <TouchableOpacity
        onPress={() => props.onTokenSelected?.(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 0,
          padding: 8,
          paddingVertical: 12,
        }}
      >
        <Coin
          address={item.address}
          chainId={1}
          symbol={item.symbol}
          size={29}
          style={{ marginEnd: 12 }}
          iconUrl={item.iconUrl}
        />
        <Text style={{ fontSize: 19, color: textColor, textTransform: 'uppercase' }} numberOfLines={1}>
          {item.symbol}
        </Text>
        <View style={{ flex: 1 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      <TextBox style={{ marginBottom: 16 }} onChangeText={(t) => {}} />

      <Text style={{ marginBottom: 4, color: secondaryTextColor, paddingHorizontal: 8 }}>Tokens</Text>
      <Separator />

      <FlatList
        data={props.tokens}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        style={{ marginHorizontal: -16 }}
      />
    </View>
  );
});
