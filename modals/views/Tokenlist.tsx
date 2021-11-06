import { Coin, SafeViewContainer } from '../../components';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import { IToken } from '../../common/Tokens';
import React from 'react';
import { fontColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onTokenSelected?: (token: IToken) => void;
  onBack?: () => void;
  tokens?: IToken[];
}

export default observer((props: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<IToken>) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 0,
          padding: 8,
          paddingVertical: 12,
        }}
        onPress={() => props.onTokenSelected?.(item)}
      >
        <Coin symbol={item.symbol} style={{ width: 25, height: 25, marginEnd: 12 }} iconUrl={item.iconUrl} />
        <Text style={{ fontSize: 19, color: fontColor, textTransform: 'uppercase' }} numberOfLines={1}>
          {item.symbol}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ ...styles.container, flexDirection: 'row' }}>
      <View style={{ ...styles.navBar, alignItems: 'flex-start', marginEnd: 8 }}>
        <BackButton onPress={props.onBack} />
      </View>

      <FlatList
        data={props.tokens}
        renderItem={renderItem}
        keyExtractor={(i) => i.symbol}
        style={{ marginTop: -6, marginEnd: -16, paddingEnd: 16 }}
      />
    </SafeViewContainer>
  );
});
