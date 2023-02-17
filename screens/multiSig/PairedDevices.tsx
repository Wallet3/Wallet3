import { ButtonV2, SafeViewContainer } from '../../components';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';

import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationPairing from '../../assets/illustrations/misc/pair_programming.svg';
import { Ionicons } from '@expo/vector-icons';
import MessageKeys from '../../common/MessageKeys';
import { PairedDevice } from '../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../viewmodels/tss/management/PairedDevices';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;
  const { t } = i18n;

  useEffect(() => {
    PairedDevices.refresh();
  }, []);

  const renderTrustedDevice = ({ item, index }: { item: PairedDevice; index: number }) => {
    return (
      <TouchableOpacity>
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
    </SafeViewContainer>
  );
});
