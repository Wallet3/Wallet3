import React, { useEffect, useState } from 'react';

import BackableScrollTitles from '../../components/BackableScrollTitles';
import Distribution from '../recovery/provider/Distribution';
import { KeyRecoveryProvider } from '../../../viewmodels/tss/KeyRecoveryProvider';
import ModalRootContainer from '../../core/ModalRootContainer';
import Overview from './Overview';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import { ReactiveScreen } from '../../../utils/device';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import ShardReceiving from '../receiver/ShardReceiving';
import { View } from 'react-native';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  close: () => void;
  onCritical?: (critical: boolean) => void;
  service: Service;
  device: PairedDevice;
}

export default observer(({ close, onCritical, service, device }: Props) => {
  const { t } = i18n;

  const [step, setStep] = useState(0);
  const [vm, setVM] = useState<ShardReceiver>();

  const titles = [t('multi-sig-modal-title-redistribute-keys'), t('multi-sig-modal-title-key-distribution')];

  const goTo = () => {
    setVM(new ShardReceiver(service));
    setStep(1);
  };

  useEffect(() => () => vm?.dispose(), [vm]);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} style={{ marginBottom: 12 }} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        {step === 0 && <Overview device={device} onNext={() => goTo()} />}
        {step === 1 && <ShardReceiving vm={vm!} close={close} onCritical={onCritical!} />}
      </View>
    </ModalRootContainer>
  );
});
