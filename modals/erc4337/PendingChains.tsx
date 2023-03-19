import { Placeholder, SafeViewContainer } from '../../components';
import { Text, TouchableOpacity, View } from 'react-native';

import { ERC4337Queue } from '../../viewmodels/transferring/ERC4337Queue';
import { FlatList } from 'react-native-gesture-handler';
import { INetwork } from '../../common/Networks';
import { MaterialIcons } from '@expo/vector-icons';
import Networks from '../../viewmodels/core/Networks';
import React from 'react';
import { SendTxRequest } from '../../viewmodels/account/AccountBase';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import styles from '../styles';

interface Props {
  vm: ERC4337Queue;
  onChainSelected: (chainId: number) => void;
}
export default ({ vm, onChainSelected }: Props) => {
  const { chainQueue: chains } = vm;
  const { borderColor, secondaryTextColor } = Theme;

  const renderItem = ({ item }: { item: { network: INetwork; items: Partial<SendTxRequest>[] } }) => {
    const { network, items } = item;
    return (
      <TouchableOpacity
        onPress={() => onChainSelected(network.chainId)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 16,
          padding: 8,
          borderColor,
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 16,
          overflow: 'hidden',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {generateNetworkIcon({ ...network, width: 15 })}
          <Text style={{ fontSize: 18, fontWeight: '500', color: network.color }}>{item.network.network}</Text>
        </View>
        <Placeholder />
        <Text style={{ color: network.color, fontSize: 17 }}>{items.length}</Text>
        <MaterialIcons name="keyboard-arrow-right" size={15} color={secondaryTextColor} style={{ marginBottom: -1 }} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={[styles.container]}>
      <Text style={{ color: secondaryTextColor }} numberOfLines={1}>
        Pending Queue
      </Text>
      <FlatList
        bounces={chains.length > 5}
        data={chains}
        keyExtractor={(c) => `${c.network.chainId}`}
        renderItem={renderItem}
        style={{ marginHorizontal: -16, marginBottom: -36 }}
        contentContainerStyle={{ paddingBottom: 36, paddingTop: 12 }}
      />
    </SafeViewContainer>
  );
};
