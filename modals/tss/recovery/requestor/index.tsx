import { ActivityIndicator, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import BackableScrollTitles from '../../../components/BackableScrollTitles';
import { FadeInDownView } from '../../../../components/animations';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import ModalRootContainer from '../../../core/ModalRootContainer';
import Preparations from './Preparations';
import { ReactiveScreen } from '../../../../utils/device';
import RecoveryAggregation from './RecoveryAggregation';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

interface Props {
  vm: KeyRecoveryRequestor;
  close: () => void;
  onCritical?: (critical: boolean) => void;
}

export default observer(({ close, onCritical, vm }: Props) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);
  const navigation = useNavigation<any>();
  const { secondaryTextColor } = Theme;

  const titles = [
    t('multi-sig-modal-title-wallet-recovery'),
    t('multi-sig-modal-title-waiting-aggregation'),
    t('msg-data-loading'),
  ];

  const goToRecovery = () => {
    setStep(1);
    vm.start();
  };

  useEffect(() => () => vm.dispose(), []);

  useEffect(() => {
    let timer: NodeJS.Timer;

    vm.once('saving', () => {
      setStep(2);
      onCritical?.(true);
    });

    vm.once('saved', () => {
      close();
      setTimeout(() => navigation.navigate('SetupPasscode'), 0);
    });

    vm.once('error', () => (timer = setTimeout(() => close(), 5000)));

    return () => {
      vm.dispose();
      clearTimeout(timer);
    };
  }, []);

  return (
    <ModalRootContainer>
      <BackableScrollTitles currentIndex={step} titles={titles} />

      <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
        {step === 0 && <Preparations onNext={() => goToRecovery()} />}
        {step === 1 && <RecoveryAggregation vm={vm} />}

        {step === 2 && (
          <FadeInDownView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: secondaryTextColor, marginVertical: 24 }}>{t('msg-wait-a-moment')}</Text>
          </FadeInDownView>
        )}
      </View>
    </ModalRootContainer>
  );
});
