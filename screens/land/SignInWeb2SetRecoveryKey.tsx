import { Button, SafeViewContainer, TextBox } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { secondaryFontColor, themeColor } from '../../constants/styles';

import { LandScreenStack } from '../navigations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MnemonicOnce from '../../viewmodels/auth/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'SetRecoveryKey'>) => {
  const { t } = i18n;
  const [key, setKey] = useState('');

  useEffect(() => {
    MnemonicOnce.generate();
  }, []);

  return (
    <SafeViewContainer style={{ ...styles.rootContainer }} paddingHeader includeTopPadding>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: -12, marginBottom: -8 }}>
        <MaterialCommunityIcons name="shield-key" size={64} color={'#61D800'} />
      </View>

      <View style={{ marginVertical: 24 }}>
        <Text style={{ marginBottom: 8 }}>Please paste your recovery key to continue:</Text>
        <TextBox onChangeText={(t) => setKey(t)} secureTextEntry />
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title={t('button-next')}
        disabled={key.length !== 64}
        txtStyle={{ textTransform: 'none' }}
        onPress={async () => {
          (await SignInWithApple.recover(key))
            ? navigation.navigate('SetupPasscode')
            : showMessage({ type: 'warning', message: t('msg-invalid-recovery-key') });
        }}
      />
    </SafeViewContainer>
  );
});
