import { FlatList, ListRenderItemInfo, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { INetwork, PublicNetworks } from '../common/Networks';
import { SafeViewContainer, Separator } from '../components';

import { NetworkIcons } from '../assets/icons/networks/color';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../constants/styles';
import styles from './styles';

interface Props {
  onNetworkPress?: (network: INetwork) => void;
}

export default observer((props: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<INetwork>) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
        onPress={() => props.onNetworkPress?.(item)}
      >
        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center' }}>
          {NetworkIcons[item.chainId] || <View />}
        </View>
        <Text style={{ fontSize: 16, marginStart: 16, fontWeight: '500', color: item.color }}>{item.network}</Text>
        <View style={{ flex: 1 }} />
        {item.l2 ? (
          <View style={{ borderRadius: 5, backgroundColor: 'deepskyblue', padding: 2, paddingHorizontal: 6 }}>
            <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>L2</Text>
          </View>
        ) : undefined}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeViewContainer style={{ padding: 16 }}>
        <Text style={{ color: secondaryFontColor }}>Switch Network</Text>
        <Separator style={{ marginVertical: 4 }} />
        <FlatList
          keyExtractor={(i) => i.network}
          data={PublicNetworks}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
          style={{ marginHorizontal: -16, paddingHorizontal: 16, marginTop: -4, marginBottom: -32 }}
        />
      </SafeViewContainer>
    </SafeAreaProvider>
  );
});
