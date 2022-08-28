import { Coin, TextBox } from '../../components';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

import { IToken } from '../../common/tokens';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

interface Props {
  tokens: IToken[];
}

export default observer((props: Props) => {
  const { textColor } = Theme;

  const renderItem = ({ item }: ListRenderItemInfo<IToken>) => {
    return (
      <TouchableOpacity
        // onPress={() => props.onTokenSelected?.(item)}
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
        <Text style={{ fontSize: 19, fontWeight: '500', color: textColor, textTransform: 'uppercase' }} numberOfLines={1}>
          {item.symbol}
        </Text>
        <View style={{ flex: 1 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={{ borderBottomWidth: 1, paddingBottom: 12 }}>
        <TextBox onChangeText={(t) => {}} />
      </View>

      <FlatList data={props.tokens} renderItem={renderItem} />
    </View>
  );
});
