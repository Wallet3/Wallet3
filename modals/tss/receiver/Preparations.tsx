import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, verifiedColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import DistributorDiscovery from '../../../viewmodels/tss/management/DistributorDiscovery';
import { FadeInRightView } from '../../../components/animations';
import { Passpad } from '../../views';
import { Service } from 'react-native-zeroconf';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import Welcome from '../components/Introduction';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext }: { onNext: () => void }) => {
  const { t } = i18n;

  return (
    <View style={{ flex: 1 }} entering={FadeInDown.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <Welcome disablePage2 disablePage3 />
      <Button title={t('button-next')} onPress={onNext} />
    </View>
  );
});
