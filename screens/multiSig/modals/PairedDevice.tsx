import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';

import Authentication from '../../../viewmodels/auth/Authentication';
import { ButtonV2 } from '../../../components';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import ScrollTitles from '../../../modals/components/ScrollTitles';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { openGlobalPasspad } from '../../../common/Modals';
import { useOptimizedSafeBottom } from '../../../utils/hardware';

const DeviceOverview = ({ device, onNext }: { device: PairedDevice; onNext: () => void }) => {
  const { secondaryTextColor, textColor, foregroundColor, systemBorderColor } = Theme;
  const { t } = i18n;
  const safeBottom = useOptimizedSafeBottom();

  return (
    <FadeInDownView style={{ flex: 1 }} delay={300}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Device deviceId={device.deviceInfo.device} os={device.deviceInfo!.rn_os!} style={{ width: 108, height: 150 }} />
        <Text style={{ marginTop: 16, fontWeight: '500', color: secondaryTextColor }}>
          {`${device.deviceInfo.name}, ${device.deviceInfo.os} ${device.deviceInfo.osVersion}`}
        </Text>
        <Text style={{ marginTop: 12, fontWeight: '500', color: secondaryTextColor, fontSize: 12 }}>
          {`${t('multi-sig-modal-txt-last-used-time')}: ${device.lastUsedTimestamp}`}
        </Text>
      </View>

      <FadeInDownView delay={400}>
        <ButtonV2
          title={t('button-view-secret')}
          style={{ marginBottom: safeBottom }}
          onPress={onNext}
          icon={() => <Ionicons name="lock-closed" color="#fff" size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};

export default ({ device }: { device: PairedDevice }) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);

  const goTo = (step: number) => {
    setStep(step);
  };

  const authAndNext = async () => {
    let success = false;

    const autoAuth = async (pin?: string) => {
      const secret = await Authentication.decryptForever(device.encryptedRootShard, pin);
      success = secret ? true : false;
      return success;
    };

    await openGlobalPasspad({ onAutoAuthRequest: autoAuth, onPinEntered: autoAuth });

    if (success) goTo(1);
  };

  return (
    <ModalRootContainer>
      <ScrollTitles
        currentIndex={step}
        data={[t('multi-sig-screen-paired-device'), t('multi-sig-modal-title-secret-key')]}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
        style={{ flexGrow: 0 }}
      />

      {step === 0 && <DeviceOverview device={device} onNext={authAndNext} />}
    </ModalRootContainer>
  );
};
