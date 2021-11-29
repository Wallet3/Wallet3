import { FlatList, ListRenderItemInfo, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { INetwork, PublicNetworks } from '../common/Networks';
import { SafeViewContainer, Separator } from '../components';

import { Feather } from '@expo/vector-icons';
import { NetworkIcons } from '../assets/icons/networks/color';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../constants/styles';
import styles from './styles';

interface Props {
  onNetworkPress?: (network: INetwork) => void;
}

export default observer((props: Props) => {
  const { t } = i18n;

  const renderItem = ({ item }: ListRenderItemInfo<INetwork>) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9 }}
        onPress={() => props.onNetworkPress?.(item)}
      >
        <Feather
          name="check"
          color={item.color}
          size={15}
          style={{ opacity: Networks.current.network === item.network ? 1 : 0 }}
        />

        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center', marginStart: 8 }}>
          {NetworkIcons[item.chainId] || <View />}
        </View>

        <Text style={{ fontSize: 16, marginStart: 12, fontWeight: '500', color: item.color }}>{item.network}</Text>

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
        <Text style={{ color: secondaryFontColor }}>{t('modal-networks-switch')}</Text>
        <Separator style={{ marginVertical: 4 }} />
        <FlatList
          keyExtractor={(i) => i.network}
          data={PublicNetworks}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 36 }}
          style={{ marginHorizontal: -16, paddingHorizontal: 16, marginTop: -4, marginBottom: -36 }}
        />
      </SafeViewContainer>
    </SafeAreaProvider>
  );
});
