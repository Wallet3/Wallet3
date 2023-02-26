import { ActivityIndicator, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import Aggregation from '../../../modals/tss/aggregator/Aggregation';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import ConnectDevices from '../../../modals/tss/distributor/ConnectDevices';
import Explanation from './views/Explanation';
import { FadeInDownView } from '../../../components/animations';
import { ModalMarginScreen } from '../../../modals/styles';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { MultiSigWallet } from '../../../viewmodels/wallet/MultiSigWallet';
import { ReactiveScreen } from '../../../utils/device';
import { ShardsAggregator } from '../../../viewmodels/tss/ShardsAggregator';
import ShardsDistribution from '../../../modals/tss/distributor/ShardsDistribution';
import { ShardsDistributionMore } from '../../../viewmodels/tss/ShardsDistributionMore';
import Theme from '../../../viewmodels/settings/Theme';
import ThresholdSetting from '../../../modals/tss/distributor/ThresholdSetting';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';

interface Props {
  wallet: MultiSigWallet;
  close: () => void;
  onCritical: (flag: boolean) => void;
}

export default observer(({ wallet, close, onCritical }: Props) => {
  const { t } = i18n;
  const { textColor } = Theme;
  const [current, setCurrent] = useState({ step: 0, isRTL: false });
  const [aggregator, setAggregator] = useState<ShardsAggregator>();
  const [distributor, setDistributor] = useState<ShardsDistributionMore>();

  const titles = [
    t('multi-sig-modal-title-preparations'),
    t('multi-sig-modal-title-waiting-aggregation'),
    t('msg-data-loading'),
    t('multi-sig-modal-title-connect-devices'),
    t('multi-sig-modal-title-key-distribution'),
  ];

  const goTo = (step: number, isRTL = false) => {
    step = Math.max(step, 0);
    setCurrent({ step, isRTL });
  };

  const goToAggregation = async () => {
    let vm: ShardsAggregator | undefined;

    const auth = async (pin?: string) => {
      vm = await wallet.requestShardsAggregator({ rootShard: true, bip32Shard: true }, pin);
      return vm ? true : false;
    };

    if (!(await openGlobalPasspad({ onAutoAuthRequest: auth, onPinEntered: auth, fast: true }))) return;

    setAggregator(vm!);
    vm!.start();
    vm?.once('aggregated', () => setTimeout(() => current.step === 1 && goTo(2), 5000));

    goTo(1);
  };

  const goToConnectDevices = async () => {
    goTo(2);
    onCritical(true);
    await sleep(500);

    const { rootShares, bip32Shares, rootEntropy } = aggregator!;
    const vm = new ShardsDistributionMore({
      bip32Shares: bip32Shares!,
      rootShares: rootShares!,
      rootEntropy: Buffer.from(rootEntropy!, 'hex'),
      wallet,
      autoStart: true,
    });

    setDistributor(vm);
    await sleep(100);
    onCritical(false);
    goTo(3);
  };

  useEffect(
    () => () => {
      aggregator?.dispose();
    },
    [aggregator]
  );

  useEffect(
    () => () => {
      distributor?.dispose();
    },
    [distributor]
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
        {step === 0 && <Explanation onNext={goToAggregation} />}

        {step === 1 && aggregator && (
          <Aggregation
            vm={aggregator}
            buttonTitle={t('button-next')}
            buttonDisabled={!aggregator?.aggregated}
            onButtonPress={goToConnectDevices}
          />
        )}

        {step === 2 && (
          <FadeInDownView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: textColor, marginVertical: 24 }}>{t('msg-wait-a-moment')}</Text>
          </FadeInDownView>
        )}

        {step === 3 && distributor && <ThresholdSetting vm={distributor} onNext={() => goTo(4)} />}
        {step === 4 && distributor && <ShardsDistribution vm={distributor} close={close} onCritical={onCritical} />}
      </View>
    </ModalRootContainer>
  );
});