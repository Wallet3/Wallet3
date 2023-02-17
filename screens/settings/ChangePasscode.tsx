import Authentication from '../../viewmodels/auth/Authentication';
import ConfirmPasscode from '../components/ConfirmPasscode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeViewContainer } from '../../components';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const updatePasscode = (passcode: string) => {
    Authentication.setupPin(passcode);
    navigation.pop();
  };

  return (
    <SafeAreaProvider>
      <SafeViewContainer style={{ paddingHorizontal: 16, flex: 1 }}>
        <ConfirmPasscode onDone={(v) => updatePasscode(v)} />
      </SafeViewContainer>
    </SafeAreaProvider>
  );
});
