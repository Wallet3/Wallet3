import React, { useState } from 'react';

import Authentication from '../../../viewmodels/auth/Authentication';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import { DateTimeFormatter } from '../../../utils/formatter';
import DeleteConfirmationView from './views/DeleteConfirmationView';
import { DeviceOverview } from './views/DeviceOverview';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { MultiSigKeyDeviceInfo } from '../../../models/entities/MultiSigKey';
import Theme from '../../../viewmodels/settings/Theme';
import dayjs from 'dayjs';
import i18n from '../../../i18n';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import { startLayoutAnimation } from '../../../utils/animations';

interface Props {
  close: Function;
  device: MultiSigKeyDeviceInfo;
  disableRemove?: boolean;
  onDeleteDevice: (device: MultiSigKeyDeviceInfo) => void;
}

export default ({ device, close, onDeleteDevice: onDelete, disableRemove }: Props) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);
  const { textColor } = Theme;
  const [lastUsedAt] = useState(dayjs(device.lastUsedAt || 0).format(DateTimeFormatter));

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
    setTimeout(() => {
      onDelete(device);
      startLayoutAnimation();
    }, 500);

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
        <DeviceOverview
          deviceInfo={device}
          disableButton={disableRemove}
          lastUsedAt={lastUsedAt}
          onNext={authAndNext}
          buttonTitle={t('button-remove')}
        />
      )}

      {step === 1 && (
        <DeleteConfirmationView onDone={doDelete} message={t('multi-sig-modal-msg-delete-trusted-device')} msgAlign="auto" />
      )}
    </ModalRootContainer>
  );
};
