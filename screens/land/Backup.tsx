import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import Authentication from '../../viewmodels/Authentication';
import { LandScreenStack } from '../navigations';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SortWords } from '../components/SecretWords';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const [verified, setVerified] = useState(false);
  const { t } = i18n;

  return (
    <SafeViewContainer style={{ ...styles.rootContainer }} paddingHeader>
      <Text>{t('land-backup-SortWords')}</Text>

      <SortWords
        words={MnemonicOnce.secretWords}
        onVerified={(v) => {
          setVerified(v);
          if (v) Authentication.setUserSecretsVerified(true);
        }}
      />

      <View style={{ flex: 1 }} />

      <Button title={t('button-next')} disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
    </SafeViewContainer>
  );
});
