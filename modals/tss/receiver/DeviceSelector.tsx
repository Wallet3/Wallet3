import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, verifiedColor } from '../../../constants/styles';

import Button from '../components/Button';
import DeviceInfo from '../components/DeviceInfo';
import DistributorDiscovery from '../../../viewmodels/tss/management/DistributorDiscovery';
import { FadeInDownView } from '../../../components/animations';
import { KeyDistributionService } from '../../../viewmodels/tss/Constants';
import PairedDevice from '../../../screens/multiSig/modals/PairedDevice';
import PairedDevices from '../../../viewmodels/tss/management/PairedDevices';
import { Placeholder } from '../../../components';
import { SECOND } from '../../../utils/time';
import { Service } from 'react-native-zeroconf';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openSettings } from 'expo-linking';
import { startLayoutAnimation } from '../../../utils/animations';
import { useHorizontalPadding } from '../components/Utils';

const { View, Text, FlatList } = Animated;

const Item = ({
  item,
  selectedService,
  onPress,
}: {
  item: Service;
  selectedService?: Service;
  onPress: (item: Service) => void;
}) => {
  const marginHorizontal = useHorizontalPadding();
  const [paired] = useState(PairedDevices.findDistributor(item.name) ? true : false);

  return (
    <View entering={FadeInDown.springify()} exiting={FadeOutDown.springify()} style={{ paddingVertical: 8 }}>
      <TouchableOpacity
        disabled={paired}
        style={{ paddingHorizontal: marginHorizontal, flexDirection: 'row', alignItems: 'center', opacity: paired ? 0.45 : 1 }}
        onPress={() => onPress(item)}
      >
        <DeviceInfo info={item.txt?.info ?? {}} />

        {paired && (
          <View
            style={{
              alignSelf: 'flex-start',
              padding: 4,
              paddingHorizontal: 12,
              backgroundColor: secureColor,
              borderRadius: 6,
              marginStart: 12,
              marginTop: 4,
            }}
          >
            <Text style={{ color: '#fff', textTransform: 'uppercase', fontWeight: '600', fontSize: 10 }}>Paired</Text>
          </View>
        )}

        {selectedService?.name === item.name ? (
          <Feather name="check" size={24} color={verifiedColor} style={{ marginStart: 12 }} />
        ) : undefined}
      </TouchableOpacity>
    </View>
  );
};

export default observer(({ onNext }: { onNext: (selectedService: Service) => void }) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;
  const marginHorizontal = useHorizontalPadding();
  const [selectedService, setSelectedService] = useState<Service>();
  const [foundTimeout, setFoundTimeout] = useState(false);

  useEffect(() => DistributorDiscovery.scan(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startLayoutAnimation();
      setFoundTimeout(DistributorDiscovery.shardsDistributors.length === 0);
    }, 15 * SECOND);

    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }: { item: Service }) => {
    return <Item item={item} onPress={setSelectedService} selectedService={selectedService} />;
  };

  return (
    <View style={{ flex: 1 }} entering={FadeInRight.delay(300).springify()} exiting={FadeOutLeft.springify()}>
      <Text style={{ color: secondaryTextColor, marginHorizontal }}>{t('multi-sig-modal-connect-select-to-pair')}:</Text>

      {DistributorDiscovery.shardsDistributors.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={DistributorDiscovery.shardsDistributors}
          renderItem={renderItem}
          keyExtractor={(i) => i.name}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal }}>
          <Placeholder />
          <Placeholder />
          <ActivityIndicator size="small" />
          <Placeholder />

          {foundTimeout && (
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
        disabled={!selectedService || DistributorDiscovery.shardsDistributors.length === 0}
      />
    </View>
  );
});
