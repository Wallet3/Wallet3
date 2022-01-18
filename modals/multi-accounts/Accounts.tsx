import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeViewContainer, Separator } from '../../components';

import { Account } from '../../viewmodels/account/Account';
import AccountItem from './AccountItem';
import App from '../../viewmodels/App';
import CachedImage from 'react-native-expo-cached-image';
import MainPanel from './MainPanel';
import Networks from '../../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import rootStyles from '../styles';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

export default observer(() => {
  const swiper = useRef<Swiper>(null);

  return (
    <SafeAreaProvider style={rootStyles.safeArea}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        scrollEnabled={false}
        loop={false}
        automaticallyAdjustContentInsets
      >
        <MainPanel />
      </Swiper>
    </SafeAreaProvider>
  );
});
