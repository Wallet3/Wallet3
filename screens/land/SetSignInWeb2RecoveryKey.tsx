import { Button, SafeViewContainer } from '../../components';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { secondaryFontColor, themeColor } from '../../constants/styles';

import { LandScreenStack } from '../navigations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MnemonicOnce from '../../viewmodels/auth/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'SetRecoveryKey'>) => {
  const { t } = i18n;

  useEffect(() => {
    MnemonicOnce.generate();
  }, []);

  return (
    <SafeViewContainer style={{ ...styles.rootContainer }} paddingHeader includeTopPadding>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: -12, marginBottom: -8 }}>
        <MaterialCommunityIcons name="shield-key" size={64} color={'#61D800'} />
      </View>

      <View style={{ marginVertical: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: themeColor, marginBottom: 8 }}>
          {t('land-create-security-tips')}
        </Text>
        <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>{t('land-create-security-tips-1')}</Text>
        <Text style={{ marginStart: 16, color: secondaryFontColor }}>{t('land-create-security-tips-2')}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title={t('land-create-backup-now')}
        disabled={MnemonicOnce.secretWords.length < 12}
        txtStyle={{ textTransform: 'none' }}
        onPress={() => navigation.navigate('Backup')}
      />
    </SafeViewContainer>
  );
});
