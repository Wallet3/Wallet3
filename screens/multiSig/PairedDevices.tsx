import { ButtonV2, Placeholder, SafeViewContainer } from '../../components';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import Device from '../../components/Device';
import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationPairing from '../../assets/illustrations/misc/pair_programming.svg';
import { Ionicons } from '@expo/vector-icons';
import MessageKeys from '../../common/MessageKeys';
import ModalRootContainer from '../../modals/core/ModalRootContainer';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { PairedDevice } from '../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../viewmodels/tss/management/PairedDevices';
import { Portal } from 'react-native-portalize';
import ScrollTitles from '../../modals/components/ScrollTitles';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize';
import { warningColor } from '../../constants/styles';

export default observer(() => {
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;
  const { ref, close, open } = useModalize();
  const { t } = i18n;
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice>();

  useEffect(() => {
    PairedDevices.refresh();
  }, []);

  const renderTrustedDevice = ({ item, index }: { item: PairedDevice; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDevice(item);
          open();
        }}
      >
        <FadeInDownView style={{ paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row' }} delay={index * 50}>
          <DeviceInfo info={item.deviceInfo} light />
        </FadeInDownView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ width: '100%', height: '100%' }}>
      {PairedDevices.hasDevices ? (
        <FlatList
          style={{ flexGrow: 1, marginHorizontal: -16, marginTop: -16 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          data={PairedDevices.devices}
          renderItem={renderTrustedDevice}
          keyExtractor={(i) => i.id}
        />
      ) : (
        <View style={{ alignSelf: 'center', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <IllustrationPairing width={150} height={150} />
          <Text style={{ color: secondaryTextColor, textTransform: 'capitalize', fontWeight: '500' }}>
            {t('multi-sig-screen-txt-no-paired-devices')}
          </Text>
        </View>
      )}

      <ButtonV2
        title={t('button-start-pairing')}
        icon={() => <Ionicons name="phone-portrait-outline" color="#fff" size={17} />}
        style={{ marginTop: 12 }}
        onPress={() => PubSub.publish(MessageKeys.openShardReceiver)}
      />

      <Portal>
        <ModalizeContainer ref={ref}>
          <ModalRootContainer>
            <ScrollTitles
              data={[t('multi-sig-screen-paired-device')]}
              contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
              style={{ flexGrow: 0 }}
            />

            {selectedDevice && (
              <FadeInDownView style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} delay={300}>
                <Device
                  deviceId={selectedDevice.deviceInfo.device}
                  os={selectedDevice.deviceInfo!.rn_os!}
                  style={{ width: 108, height: 150 }}
                />
                <Text style={{ marginTop: 16, fontWeight: '500', color: secondaryTextColor }}>
                  {`${selectedDevice.deviceInfo.name}, ${selectedDevice.deviceInfo.os} ${selectedDevice.deviceInfo.osVersion}`}
                </Text>
                <Text style={{ marginTop: 12, fontWeight: '500', color: secondaryTextColor, fontSize: 12 }}>
                  {`${selectedDevice.lastUsedTimestamp}`}
                </Text>
              </FadeInDownView>
            )}

            <FadeInDownView delay={400}>
              <ButtonV2 title={t('button-view-secret')} />
            </FadeInDownView>
          </ModalRootContainer>
        </ModalizeContainer>
      </Portal>
    </SafeViewContainer>
  );
});
