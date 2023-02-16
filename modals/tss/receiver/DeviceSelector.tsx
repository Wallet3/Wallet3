import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, verifiedColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import LanDiscovery from '../../../viewmodels/tss/LanDiscovery';
import { Passpad } from '../../views';
import { Service } from 'react-native-zeroconf';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { calcHorizontalPadding } from '../components/Utils';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext }: { onNext: (selectedService: Service) => void }) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;
  const [marginHorizontal] = useState(calcHorizontalPadding());
  const [selectedService, setSelectedService] = useState<Service>();

  const renderItem = ({ item }: { item: Service }) => {
    return (
      <View entering={FadeInDown.springify()} exiting={FadeOutDown.springify()} style={{ paddingVertical: 8 }}>
        <TouchableOpacity
          style={{ paddingHorizontal: marginHorizontal, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setSelectedService(item)}
        >
          <DeviceInfo info={item.txt?.info ?? {}} />
          {selectedService?.name === item.name ? (
            <Feather name="check" size={24} color={verifiedColor} style={{ marginStart: 12 }} />
          ) : undefined}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }} entering={FadeInRight.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <Text style={{ color: secondaryTextColor, marginHorizontal }}>{t('multi-sign-connect-select-to-pair')}:</Text>

      <FlatList style={{ flex: 1 }} data={LanDiscovery.services} renderItem={renderItem} keyExtractor={(i) => i.name} />

      <Button
        title={t('button-start-pairing')}
        onPress={() => onNext(selectedService!)}
        disabled={!selectedService || LanDiscovery.services.length === 0}
      />
    </View>
  );
});
