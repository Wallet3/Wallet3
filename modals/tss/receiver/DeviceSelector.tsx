import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button';
import DeviceInfo from '../components/DeviceInfo';
import { FadeInDownView } from '../../../components/animations';
import LanDiscovery from '../../../common/p2p/LanDiscovery';
import { Placeholder } from '../../../components';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import Theme from '../../../viewmodels/settings/Theme';
import { calcHorizontalPadding } from '../components/Utils';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openSettings } from 'expo-linking';
import { startLayoutAnimation } from '../../../utils/animations';
import { verifiedColor } from '../../../constants/styles';

const { View, Text, FlatList } = Animated;

export default observer(({ onNext }: { onNext: (selectedService: Service) => void }) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;
  const [marginHorizontal] = useState(calcHorizontalPadding());
  const [selectedService, setSelectedService] = useState<Service>();
  const [scanTimeout, setScanTimeout] = useState(false);

  useEffect(() => {
    LanDiscovery.scan();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startLayoutAnimation();
      setScanTimeout(LanDiscovery.shardsDistributors.length === 0);
    }, 15 * SECOND);

    return () => clearTimeout(timer);
  }, []);

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
      <Text style={{ color: secondaryTextColor, marginHorizontal }}>{t('multi-sig-modal-connect-select-to-pair')}:</Text>

      {LanDiscovery.shardsDistributors.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={LanDiscovery.shardsDistributors}
          renderItem={renderItem}
          keyExtractor={(i) => i.name}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal }}>
          <Placeholder />
          <Placeholder />
          <ActivityIndicator size="small" />
          <Placeholder />

          {scanTimeout && (
            <FadeInDownView>
              <TouchableOpacity onPress={openSettings}>
                <Text style={{ marginTop: 24, color: secondaryTextColor, fontWeight: '500', marginHorizontal }}>
                  {t('multi-sig-modal-msg-no-devices-found')}
                </Text>
              </TouchableOpacity>
            </FadeInDownView>
          )}

          <Placeholder />
        </View>
      )}

      <Button
        title={t('button-start-pairing')}
        onPress={() => onNext(selectedService!)}
        disabled={!selectedService || LanDiscovery.shardsDistributors.length === 0}
      />
    </View>
  );
});
