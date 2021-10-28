import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import { Coin } from '../../components';
import React from 'react';
import { fontColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

const data = [
  { symbol: 'ETH' },
  { symbol: 'USDC' },
  { symbol: 'DAI' },
  { symbol: 'CRV' },
  { symbol: 'UNI' },
  { symbol: 'MKR' },
  { symbol: 'COMP' },
  { symbol: 'Sushi' },
  { symbol: 'LINK' },
  { symbol: 'Aave' },
];

interface Props {
  onTokenSelected?: () => void;
  onBack?: () => void;
}

export default observer((props: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<{ symbol: string }>) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 0,
          padding: 8,
        }}
        onPress={props.onTokenSelected}
      >
        <Coin symbol={item.symbol} style={{ width: 25, height: 25, marginEnd: 12 }} />
        <Text style={{ fontSize: 19, color: fontColor, textTransform: 'uppercase' }} numberOfLines={1}>
          {item.symbol}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ ...styles.container, flexDirection: 'row' }}>
      <View style={{ ...styles.navBar, alignItems: 'flex-start', marginEnd: 8 }}>
        <BackButton onPress={props.onBack} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(i) => i.symbol}
        style={{ marginTop: -2, marginEnd: -16, paddingEnd: 16 }}
      />
    </View>
  );
});
