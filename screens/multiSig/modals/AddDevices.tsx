import React, { useEffect, useState } from 'react';

import Aggregation from '../../../modals/tss/aggregator/Aggregation';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import Explanation from './views/Explanation';
import { ModalMarginScreen } from '../../../modals/styles';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { MultiSigWallet } from '../../../viewmodels/wallet/MultiSigWallet';
import { ReactiveScreen } from '../../../utils/device';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import Theme from '../../../viewmodels/settings/Theme';
import { View } from 'react-native';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../common/Modals';

interface Props {
  wallet: MultiSigWallet;
  shardsDistributor?: ShardsDistributor;
  close: () => void;
}

export default observer(({ wallet, shardsDistributor, close }: Props) => {
  const { t } = i18n;
  const { textColor } = Theme;
  const [current, setCurrent] = useState({ step: 0, isRTL: false });
  const [shardsAggregator, setShardsAggregator] = useState<ShardsAggregator>();

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

  const goAggregation = async () => {
    let vm: ShardsAggregator | undefined;

    const auth = async (pin?: string) => {
      vm = await wallet.requestShardsAggregator({ rootShard: true }, pin);
      return vm ? true : false;
    };

    if (!(await openGlobalPasspad({ onAutoAuthRequest: auth, onPinEntered: auth, fast: true }))) return;

    setShardsAggregator(vm!);
    goTo(1);
    vm!.start();
  };

  useEffect(
    () => () => {
      shardsAggregator?.dispose();
    },
    [shardsAggregator]
  );

  useEffect(
    () => () => {
      shardsDistributor?.dispose();
    },
    [shardsDistributor]
  );

  const { step, isRTL } = current;

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        titles={titles}
        // backDisabled={vm.status !== ShardsDistributionStatus.ready || step <= 1}
        // showBack={vm.status === ShardsDistributionStatus.ready && step > 1}
        currentIndex={step}
        iconColor={textColor}
        onBackPress={() => goTo(step - 1, true)}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        {step === 0 && <Explanation onNext={goAggregation} />}
        {step === 1 && <Aggregation vm={shardsAggregator!} buttonTitle={t('button-next')} />}
        {/* {step === 0 && <ConnectDevices vm={vm} onNext={() => goTo(2)} isRTL={isRTL} />}
        {step === 1 && <ShardsDistribution vm={vm} close={close} onCritical={onCritical} />} */}
      </View>
    </ModalRootContainer>
  );
});
