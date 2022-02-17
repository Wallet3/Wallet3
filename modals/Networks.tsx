import { EVMIcon, NetworkIcons } from '../assets/icons/networks/color';
import { FlatList, ListRenderItemInfo, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeViewContainer, Separator } from '../components';
import { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import { INetwork } from '../common/Networks';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../viewmodels/settings/Theme';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props {
  onNetworkPress?: (network: INetwork) => void;
  networks?: INetwork[];
  selectedNetwork?: INetwork | null;
  title?: string;
}

export default observer(({ title, onNetworkPress, networks, selectedNetwork }: Props) => {
  const { t } = i18n;
  const { backgroundColor, secondaryTextColor, borderColor } = Theme;
  const [nets, setNets] = useState<INetwork[]>();

  useEffect(() => {
    const timer = setTimeout(() => setNets(networks ?? Networks.all), 25);
    return () => {
      clearTimeout(timer);
    };
  }, [networks]);

  const renderItem = ({ item }: ListRenderItemInfo<INetwork>) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9 }}
        onPress={() => onNetworkPress?.(item)}
      >
        <Feather
          name="check"
          color={item.color}
          size={15}
          style={{ opacity: (selectedNetwork ?? Networks.current)?.network === item.network ? 1 : 0 }}
        />

        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center', marginStart: 8 }}>
          {NetworkIcons[item.chainId] || <EVMIcon title={item.network} color={item.color} />}
        </View>

        <Text style={{ fontSize: 16, marginStart: 12, fontWeight: '500', color: item.color, maxWidth: 300 }} numberOfLines={1}>
          {item.network}
        </Text>

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
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      <Swiper scrollEnabled={false}>
        <SafeViewContainer style={{ padding: 16 }}>
          <Text style={{ color: secondaryTextColor }} numberOfLines={1}>
            {title ?? t('modal-networks-switch')}
          </Text>
          <Separator style={{ marginVertical: 4, backgroundColor: borderColor }} />
          <FlatList
            keyExtractor={(i) => i.network}
            data={nets}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 36 }}
            style={{ marginHorizontal: -16, paddingHorizontal: 16, marginTop: -4, marginBottom: -36 }}
          />
        </SafeViewContainer>
      </Swiper>
    </SafeAreaProvider>
  );
});
