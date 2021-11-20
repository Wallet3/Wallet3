import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import DAppHub from '../../viewmodels/DAppHub';
import { FontAwesome } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import { WalletConnect_v1 } from '../../viewmodels/WalletConnect_v1';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

export default observer(() => {
  const renderItem = ({ item }: { item: WalletConnect_v1 }) => {
    const { appMeta } = item;

    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
          <Image source={{ uri: appMeta?.icons[0] }} style={{ width: 32, height: 32, marginEnd: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 17 }} numberOfLines={1}>
              {appMeta?.name}
            </Text>
            <Text style={{ color: secondaryFontColor, fontSize: 12, marginTop: 4 }}>
              {`Last used: ${item.lastUsedTimestamp.toLocaleDateString(undefined, {})}`}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 12, marginEnd: -12 }}>
          <FontAwesome name="trash-o" size={19} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <FlatList data={DAppHub.clients} renderItem={renderItem} keyExtractor={(i) => i.peerId} />
    </View>
  );
});
