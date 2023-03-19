import { ButtonV2, SafeViewContainer } from '../../components';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationPairing from '../../assets/illustrations/misc/pair_programming.svg';
import { Ionicons } from '@expo/vector-icons';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { PairedDevice } from '../../viewmodels/tss/management/PairedDevice';
import { PairedDeviceModal } from './modals';
import PairedDevices from '../../viewmodels/tss/management/PairedDevices';
import { Portal } from 'react-native-portalize';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openShardReceiver } from '../../common/Modals';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize';

interface Props {
  route?: { params?: { paddingHeader?: boolean } };
}

export default observer(({ route }: Props) => {
  const { secondaryTextColor, backgroundColor } = Theme;
  const { ref, close, open } = useModalize();
  const { t } = i18n;
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice>();
  const { devices, hasDevices } = PairedDevices;
  const [_, forceUpdate] = useState(0);

  useEffect(() => startLayoutAnimation(), [devices]);

  const renderTrustedDevice = ({ item, index }: { item: PairedDevice; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDevice(item);
          open();
        }}
      >
        <FadeInDownView style={{ paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row' }} delay={index * 50}>
          <DeviceInfo info={item.deviceInfo} light mainAddress={item.mainAddress} />
        </FadeInDownView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={{ width: '100%', height: '100%', backgroundColor }} paddingHeader={route?.params?.paddingHeader}>
      {hasDevices ? (
        <FlatList
          data={devices}
          keyExtractor={(i) => i.id}
          bounces={devices.length > 7}
          renderItem={renderTrustedDevice}
          contentContainerStyle={{ paddingVertical: 8 }}
          style={{ flexGrow: 1, marginHorizontal: -16, marginTop: -16 }}
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
        onPress={() => openShardReceiver()}
      />

      <Portal>
        <ModalizeContainer ref={ref} withHandle={false}>
          {selectedDevice && (
            <PairedDeviceModal close={close} device={selectedDevice} onForceUpdate={() => forceUpdate(Date.now())} />
          )}
        </ModalizeContainer>
      </Portal>
    </SafeViewContainer>
  );
});
