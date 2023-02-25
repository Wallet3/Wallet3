// @ts-nocheck

import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

import App from '../../viewmodels/core/App';
import Backup from './Backup';
import CreateMultiSigWallet from './CreateMultiSigWallet';
import CreateWallet from './CreateWallet';
import ImportWallet from './ImportWallet';
import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import OtherOptions from './OtherOptions';
import SetRecoveryKey from './SignInWeb2SetRecoveryKey';
import SetupPasscode from './Passcode';
import ViewRecoveryKey from './SignInWeb2ViewRecoveryKey';
import Welcome from './Welcome';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const { Navigator, Screen } = createNativeStackNavigator();

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;

  return (
    <Navigator
      initialRouteName={App.hasWallet ? 'SetupPasscode' : 'Welcome'}
      screenOptions={{
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
        ),
      }}
    >
      <Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Screen name="OtherOptions" component={OtherOptions} options={{ title: t('land-welcome-other-options') }} />
      <Screen name="ImportWallet" component={ImportWallet} options={{ title: t('land-welcome-import-wallet') }} />
      <Screen
        name="CreateMultiSigWallet"
        component={CreateMultiSigWallet}
        options={{ title: t('land-welcome-create-multi-sig-wallet') }}
      />
      <Screen name="CreateWallet" component={CreateWallet} options={{ title: t('land-welcome-create-wallet') }} />
      <Screen name="Backup" component={Backup} options={{ title: t('land-backup-title') }} />
      <Screen
        name="SetupPasscode"
        component={SetupPasscode}
        options={{ headerLeft: () => <View />, title: t('land-passcode-title'), gestureEnabled: false }}
      />
      <Screen name="ViewRecoveryKey" component={ViewRecoveryKey} options={{ title: t('land-sign-in-web2-recovery-key') }} />
      <Screen name="SetRecoveryKey" component={SetRecoveryKey} options={{ title: t('land-sign-in-web2-recovery-key') }} />
    </Navigator>
  );
});
