import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';

import { DrawerActions } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import MultiSigManagement from './MultiSigManagement';
import PairedDevices from './PairedDevices';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation }: DrawerScreenProps<{}, never>) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { textColor, foregroundColor, systemBorderColor } = Theme;

  const { top } = useSafeAreaInsets();
  const { t } = i18n;
  const headerScroller = useRef<FlatList>(null);
  const swiper = useRef<Swiper>(null);

  const headerHeight = 49;
  const scrollToIndex = (index: number) => {
    headerScroller.current?.scrollToIndex({ index, animated: true });
    setCurrentPage(index);
  };

  const headers = [
    <View
      key="paired_devices"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <Ionicons name="phone-portrait-outline" size={15} color={textColor} />
      <Text style={{ color: textColor, fontWeight: '600', marginHorizontal: 8, fontSize: 18, textTransform: 'capitalize' }}>
        {t('multi-sig-screen-paired-devices')}
      </Text>
    </View>,
    <View
      key="my_multiSig_wallet"
      style={{ padding: 12, flexDirection: 'row', alignItems: 'center', height: headerHeight, justifyContent: 'center' }}
    >
      <MaterialCommunityIcons name="key-chain-variant" color={textColor} size={19} />
      <Text style={{ color: textColor, fontWeight: '600', marginStart: 8, fontSize: 18 }}>
        {t('multi-sig-modal-title-welcome')}
      </Text>
    </View>,
  ];

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.333, borderBottomColor: systemBorderColor }}
      >
        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', zIndex: 9 }}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        >
          <Feather name="menu" size={20} color={foregroundColor} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: -2,
          }}
        >
          <FlatList
            ref={headerScroller}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            data={headers}
            renderItem={({ item }) => item}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            style={{ height: headerHeight }}
          />
        </View>

        <TouchableOpacity
          style={{ padding: 16, paddingVertical: 8, position: 'absolute', right: 0, bottom: 4, zIndex: 9 }}
          onPress={() => {
            const to = currentPage === 1 ? 0 : 1;
            scrollToIndex(to);
            swiper.current?.scrollTo(to, true);
          }}
        >
          {currentPage === 0 ? (
            <MaterialCommunityIcons name="key-chain-variant" color={textColor} size={21} />
          ) : (
            <Ionicons name="phone-portrait-outline" size={18} color={textColor} />
          )}
        </TouchableOpacity>
      </View>

      <Swiper ref={swiper} showsPagination={false} showsButtons={false} loop={false} onIndexChanged={scrollToIndex}>
        <PairedDevices />
        <MultiSigManagement />
      </Swiper>
    </View>
  );
});
