import React, { useEffect, useState } from 'react';

import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Distribution from './Distribution';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import ModalRootContainer from '../../../core/ModalRootContainer';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import Selector from './Selector';
import { Service } from 'react-native-zeroconf';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  close: () => void;
  onCritical?: (critical: boolean) => void;
  service: Service;
}

export default observer(({ close, onCritical, service }: Props) => {
  const { t } = i18n;

  const [step, setStep] = useState(0);
  const [vm, setVM] = useState<KeyRecoveryProvider>();

  const titles = [t('multi-sig-modal-title-wallet-recovery'), t('multi-sig-modal-title-key-distribution')];

  const goTo = (device: PairedDevice) => {
    setVM(new KeyRecoveryProvider({ service, shardKey: device.shard }));
    setStep(1);
  };

  useEffect(() => () => vm?.dispose(), [vm]);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} style={{ marginBottom: 12 }} />
      {step === 0 && <Selector onNext={goTo} />}
      {step === 1 && <Distribution vm={vm!} close={close} onCritical={onCritical} />}
    </ModalRootContainer>
  );
});
