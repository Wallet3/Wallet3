import { Coin, SafeViewContainer } from '../../components';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

import BackButton from '../components/BackButton';
import { Feather } from '@expo/vector-icons';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/tokens';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onTokenSelected?: (token: IToken) => void;
  selectedToken?: IToken | null;
  onBack?: () => void;
  tokens?: IToken[];
  themeColor?: string;
  network: INetwork;
}

export default observer((props: Props) => {
  const { textColor } = Theme;

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
          chainId={props.network.chainId}
          symbol={item.symbol}
          style={{ width: 25, height: 25, marginEnd: 12 }}
          iconUrl={item.logoURI}
        />
        <Text style={{ fontSize: 19, color: textColor }} numberOfLines={1}>
          {item.symbol}
        </Text>
        <View style={{ flex: 1 }} />
        {props.selectedToken === item && <Feather name="check" size={16} color={props.themeColor} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ ...styles.container, flexDirection: 'row' }}>
      <View style={{ ...styles.navBar, alignItems: 'flex-start', marginEnd: 8 }}>
        <BackButton onPress={props.onBack} color={props.themeColor} />
      </View>

      <FlatList
        data={props.tokens}
        renderItem={renderItem}
        keyExtractor={(i) => i.address}
        contentContainerStyle={{ paddingBottom: 36, paddingTop: 9 }}
        style={{ marginTop: -16, marginEnd: -16, paddingEnd: 16, marginBottom: -36 }}
      />
    </SafeViewContainer>
  );
});
