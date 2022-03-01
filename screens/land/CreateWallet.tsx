import { Button, Mnemonic, SafeViewContainer } from '../../components';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { LandScreenStack } from '../navigations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
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

      <Mnemonic phrase={MnemonicOnce.secretWords} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: secondaryFontColor }}></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ padding: 8, paddingEnd: 10 }} onPress={() => MnemonicOnce.generate(12)}>
            <Text style={{ color: MnemonicOnce.secretWords.length === 12 ? fontColor : secondaryFontColor }}>12</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, marginTop: -2 }}>/</Text>
          <TouchableOpacity style={{ padding: 8, zIndex: 5 }} onPress={() => MnemonicOnce.generate(24)}>
            <Text style={{ color: MnemonicOnce.secretWords.length === 24 ? fontColor : secondaryFontColor }}>24</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title={t('land-create-backup-later')}
        disabled={MnemonicOnce.secretWords.length < 12}
        themeColor={themeColor}
        reverse
        style={{ marginBottom: 12 }}
        txtStyle={{ color: themeColor, textTransform: 'none' }}
        onPress={() => navigation.navigate('SetupPasscode')}
      />

      <Button
        title={t('land-create-backup-now')}
        disabled={MnemonicOnce.secretWords.length < 12}
        txtStyle={{ textTransform: 'none' }}
        onPress={() => navigation.navigate('Backup')}
      />
    </SafeViewContainer>
  );
});
