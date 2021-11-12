import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import Authentication from '../../viewmodels/Authentication';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SortWords } from '../components/SecretWords';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const [verified, setVerified] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={{ ...styles.rootContainer, paddingTop: 0 }}>
        <Text>Please sort the words correctly. </Text>

        <SortWords
          words={MnemonicOnce.secretWords}
          onVerified={(v) => {
            setVerified(v);
            if (v) Authentication.setUserSecretsVerified(true);
          }}
        />

        <View style={{ flex: 1 }} />

        <Button title="Next" disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
