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
import ShardsDistribution from '../../../modals/tss/distributor/ShardsDistribution';
import { ShardsRedistributionController } from '../../../viewmodels/tss/ShardsRedistributionController';
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
  const { textColor, secondaryTextColor } = Theme;
  const [current, setCurrent] = useState({ step: 0, isRTL: false });
  const [controller] = useState(new ShardsRedistributionController(wallet));

  const titles = [
    t('multi-sig-modal-title-redistribute-keys'),
    t('multi-sig-modal-title-waiting-aggregation'),
    t('msg-data-loading'),
    t('multi-sig-modal-title-connect-devices'),
    t('multi-sig-modal-title-set-threshold'),
    t('multi-sig-modal-title-key-distribution'),
  ];

  const goTo = (step: number, isRTL = false) => {
    step = Math.max(step, 0);
    setCurrent({ step, isRTL });
  };

  const goToAggregation = async () => {
    const auth = async (pin?: string) => {
      const vm = await controller.requestAggregator(pin);

      vm?.once('aggregated', () => {
        vm.dispose();
        goToConnectDevices();
      });

      return vm ? true : false;
    };

    if (!(await openGlobalPasspad({ onAutoAuthRequest: auth, onPinEntered: auth, fast: true }))) return;

    goTo(1);
  };

  const goToConnectDevices = async () => {
    goTo(2);

    onCritical(true);
    await sleep(500);
    await controller.requestRedistributor();
    await sleep(100);
    onCritical(false);

    goTo(3);
  };

  useEffect(() => () => controller?.dispose(), [controller]);

  const { step, isRTL } = current;
  const { aggregator, redistributor } = controller;

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        titles={titles}
        // backDisabled={step === 3}
        showBack={step > 3}
        currentIndex={step}
        iconColor={textColor}
        onBackPress={() => goTo(step - 1, true)}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flex: 1, width: ReactiveScreen.width - ModalMarginScreen * 2, marginHorizontal: -16 }}>
        {step === 0 && <Explanation onNext={() => goToAggregation()} />}

        {step === 1 && aggregator && (
          <Aggregation
            vm={aggregator}
            onSecretCacheSelected={aggregator.setSecretsCached}
            buttonTitle={t('button-next')}
            hideButton
          />
        )}

        {step === 2 && (
          <FadeInDownView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: secondaryTextColor, marginVertical: 24 }}>{t('msg-wait-a-moment')}</Text>
          </FadeInDownView>
        )}

        {step === 3 && redistributor && <ConnectDevices vm={redistributor} onNext={() => goTo(4)} isRTL={isRTL} />}
        {step === 4 && redistributor && <ThresholdSetting vm={redistributor} onNext={() => goTo(5)} isRTL={isRTL} />}
        {step === 5 && redistributor && (
          <ShardsDistribution includeSelf vm={redistributor} close={close} onCritical={onCritical} />
        )}
      </View>
    </ModalRootContainer>
  );
});
