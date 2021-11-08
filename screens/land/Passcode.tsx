import { Loader, SafeViewContainer } from '../../components';
import React, { useState } from 'react';

import AppVM from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import ConfirmPasscode from '../components/ConfirmPasscode';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({}: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const [busy, setBusy] = useState(false);

  const finishInitialization = async (passcode: string) => {
    setBusy(true);

    await Authentication.setupPin(passcode);

    await Authentication.authorize(passcode);

    await MnemonicOnce.save();

    setBusy(false);

    await AppVM.init();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={styles.rootContainer}>
        <ConfirmPasscode
          biometricsSupported={Authentication.biometricsSupported}
          biometricsEnabled={Authentication.biometricsEnabled}
          onBiometricValueChange={(v) => Authentication.setBiometrics(v)}
          onDone={finishInitialization}
        />
      </SafeViewContainer>

      <Loader loading={busy} />
    </SafeAreaView>
  );
});
