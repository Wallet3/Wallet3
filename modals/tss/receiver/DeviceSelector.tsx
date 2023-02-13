import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import { Ionicons } from '@expo/vector-icons';
import LanDiscovery from '../../../viewmodels/tss/LanDiscovery';
import { Passpad } from '../../views';
import { Service } from 'react-native-zeroconf';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/ios';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext }: { onNext: () => void }) => {
  const renderItem = ({ item }: { item: Service }) => {
    return (
      <View>
        <DeviceInfo info={item.txt.info} />
      </View>
    );
  };

  return (
    <View>
      <FlatList data={LanDiscovery.services} renderItem={renderItem} keyExtractor={(i) => i.name} />
    </View>
  );
});
