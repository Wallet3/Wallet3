import { DeleteView, DeviceOverview } from './PairedDevice';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import Authentication from '../../../viewmodels/auth/Authentication';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import { ButtonV2 } from '../../../components';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import IllustrationAsk from '../../../assets/illustrations/misc/ask.svg';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { MultiSigKeyDeviceInfo } from '../../../models/entities/MultiSigKey';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../viewmodels/tss/management/PairedDevices';
import QRCode from 'react-native-qrcode-svg';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import { useOptimizedSafeBottom } from '../../../utils/hardware';
import { warningColor } from '../../../constants/styles';

export default ({ device, lastUsedAt, close }: { close: Function; device: MultiSigKeyDeviceInfo; lastUsedAt?: string }) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);
  const { textColor } = Theme;
  const [lastUsed, setLastUsed] = useState(lastUsedAt);

  const goTo = async (step: number, delay = 0) => {
    if (delay) await sleep(delay);
    setStep(step);
  };

  const authAndNext = async () => {
    const success = await openGlobalPasspad({
      fast: true,
      onAutoAuthRequest: Authentication.authorize,
      onPinEntered: Authentication.authorize,
    });

    success && goTo(1);
  };

  const doDelete = () => {
    close();
  };

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        currentIndex={step}
        showBack={step > 0}
        onBackPress={() => goTo(step - 1)}
        iconColor={textColor}
        titles={[t('multi-sig-modal-title-trusted-device'), t('multi-sig-modal-title-remove-device')]}
      />

      {step === 0 && (
        <DeviceOverview deviceInfo={device} lastUsedAt={lastUsed} onNext={authAndNext} buttonTitle={t('button-remove')} />
      )}
      {step === 1 && (
        <DeleteView onDone={doDelete} message={t('multi-sig-modal-msg-delete-trusted-device')} textAlign="auto" />
      )}
    </ModalRootContainer>
  );
};
