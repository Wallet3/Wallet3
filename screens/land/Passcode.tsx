import { Loader, SafeViewContainer } from '../../components';
import React, { useState } from 'react';

import AppVM from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import ConfirmPasscode from '../components/ConfirmPasscode';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';
import { themeColor } from '../../constants/styles';

export default observer(({}: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const { t } = i18n;
  const [busy, setBusy] = useState(false);

  const finishInitialization = async (passcode: string) => {
    setBusy(true);

    await Authentication.setupPin(passcode);

    await Authentication.authorize(passcode);

    if (await MnemonicOnce.save()) {
      AppVM.init();
    } else {
      showMessage({ message: 'msg-failed-to-import-wallet', type: 'warning' });
    }

    setBusy(false);
  };

  return (
    <SafeViewContainer style={styles.rootContainer} paddingHeader>
      <ConfirmPasscode
        biometricSupported={Authentication.biometricSupported}
        biometricEnabled={Authentication.biometricEnabled}
        onBiometricValueChange={(v) => Authentication.setBiometrics(v)}
        onDone={finishInitialization}
        themeColor={themeColor}
      />
      <Loader loading={busy} message={t('land-passcode-encrypting')} />
    </SafeViewContainer>
  );
});
