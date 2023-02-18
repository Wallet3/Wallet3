import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { ButtonV2 } from '../../../components';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import React from 'react';
import ScrollTitles from '../../../modals/components/ScrollTitles';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { t } from 'i18n-js';
import { useOptimizedSafeBottom } from '../../../utils/hardware';

export default ({ device }: { device: PairedDevice }) => {
  const safeBottom = useOptimizedSafeBottom();
  const { t } = i18n;
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;

  return (
    <ModalRootContainer>
      <ScrollTitles
        data={[t('multi-sig-screen-paired-device'), t('multi-sig-modal-title-secret-key')]}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
        style={{ flexGrow: 0 }}
      />

      {device && (
        <FadeInDownView style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} delay={300}>
          <Device deviceId={device.deviceInfo.device} os={device.deviceInfo!.rn_os!} style={{ width: 108, height: 150 }} />
          <Text style={{ marginTop: 16, fontWeight: '500', color: secondaryTextColor }}>
            {`${device.deviceInfo.name}, ${device.deviceInfo.os} ${device.deviceInfo.osVersion}`}
          </Text>
          <Text style={{ marginTop: 12, fontWeight: '500', color: secondaryTextColor, fontSize: 12 }}>
            {`${device.lastUsedTimestamp}`}
          </Text>
        </FadeInDownView>
      )}

      <FadeInDownView delay={400}>
        <ButtonV2
          title={t('button-view-secret')}
          style={{ marginBottom: safeBottom }}
          icon={() => <Ionicons name="lock-closed" color="#fff" size={16} />}
        />
      </FadeInDownView>
    </ModalRootContainer>
  );
};
