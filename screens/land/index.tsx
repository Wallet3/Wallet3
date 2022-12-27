// @ts-nocheck

import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';

import Backup from './Backup';
import CreateWallet from './CreateWallet';
import ImportWallet from './ImportWallet';
import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import SetRecoveryKey from './SignInWeb2SetRecoveryKey';
import SetupPasscode from './Passcode';
import { TouchableOpacity } from 'react-native';
import ViewRecoveryKey from './SignInWeb2ViewRecoveryKey';
import Welcome from './Welcome';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const { Navigator, Screen } = createNativeStackNavigator();

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;

  return (
    <Navigator
      screenOptions={{
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
        ),
      }}
      initialRouteName="Welcome"
    >
      <Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Screen name="ImportWallet" component={ImportWallet} options={{ title: t('land-welcome-import-wallet') }} />
      <Screen name="CreateWallet" component={CreateWallet} options={{ title: t('land-welcome-create-wallet') }} />
      <Screen name="Backup" component={Backup} options={{ title: t('land-backup-title') }} />
      <Screen name="SetupPasscode" component={SetupPasscode} options={{ title: t('land-passcode-title') }} />
      <Screen name="ViewRecoveryKey" component={ViewRecoveryKey} options={{ title: t('land-sign-in-web2-recovery-key') }} />
      <Screen name="SetRecoveryKey" component={SetRecoveryKey} options={{ title: t('land-sign-in-web2-recovery-key') }} />
    </Navigator>
  );
});
