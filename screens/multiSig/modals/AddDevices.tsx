import React, { useEffect, useState } from 'react';
import { ShardsDistributionStatus, ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { Text, View } from 'react-native';

import Authentication from '../../../viewmodels/auth/Authentication';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import { ButtonV2 } from '../../../components';
import { ClientInfo } from '../../../common/p2p/Constants';
import ConnectDevices from '../../../modals/tss/distributor/ConnectDevices';
import Device from '../../../components/Device';
import { FadeInDownView } from '../../../components/animations';
import IllustrationAsk from '../../../assets/illustrations/misc/ask.svg';
import { Ionicons } from '@expo/vector-icons';
import { ModalMarginScreen } from '../../../modals/styles';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../viewmodels/tss/management/PairedDevices';
import QRCode from 'react-native-qrcode-svg';
import { ReactiveScreen } from '../../../utils/device';
import ShardsDistribution from '../../../modals/tss/distributor/ShardsDistribution';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import { startLayoutAnimation } from '../../../utils/animations';
import { useOptimizedSafeBottom } from '../../../utils/hardware';
import { warningColor } from '../../../constants/styles';

interface Props {
  vm: ShardsDistributor;
  onCritical: (flag: boolean) => void;
  close: () => void;
}

export default observer(({ vm, onCritical, close }: Props) => {
  const { t } = i18n;
  const { textColor } = Theme;
  const [current, setCurrent] = useState({ step: 0, isRTL: false });

  const titles = [
    t('multi-sig-modal-title-preparations'),
    t('multi-sig-modal-title-connect-devices'),
    t('multi-sig-modal-title-set-threshold'),
    t('multi-sig-modal-title-key-distribution'),
  ];

  const goTo = (step: number, isRTL = false) => {
    step = Math.max(step, 0);
    setCurrent({ step, isRTL });
  };

  useEffect(() => () => vm.dispose(), []);

  const { step, isRTL } = current;

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        titles={titles}
        backDisabled={vm.status !== ShardsDistributionStatus.ready || step <= 1}
        showBack={vm.status === ShardsDistributionStatus.ready && step > 1}
        currentIndex={step}
        iconColor={textColor}
        onBackPress={() => goTo(step - 1, true)}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        {step === 0 && <ConnectDevices vm={vm} onNext={() => goTo(2)} isRTL={isRTL} />}
        {step === 1 && <ShardsDistribution vm={vm} close={close} onCritical={onCritical} />}
      </View>
    </ModalRootContainer>
  );
});
