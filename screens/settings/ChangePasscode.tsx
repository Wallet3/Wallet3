import Authentication from '../../viewmodels/Authentication';
import ConfirmPasscode from '../components/ConfirmPasscode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { SafeViewContainer } from '../../components';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const updatePasscode = (passcode: string) => {
    Authentication.setupPin(passcode);
    navigation.pop();
  };

  return (
    <SafeViewContainer style={{ paddingHorizontal: 16, flex: 1, backgroundColor: '#fff' }}>
      <ConfirmPasscode onDone={(v) => updatePasscode(v)} />
    </SafeViewContainer>
  );
});
