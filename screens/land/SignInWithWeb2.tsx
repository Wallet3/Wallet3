import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { Text, View } from 'react-native-animatable';
import { secondaryFontColor, themeColor, thirdFontColor } from '../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import i18n from '../../i18n';
import { openBrowserAsync } from 'expo-web-browser';

export default ({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;
  const [read, setRead] = useState(false);

  return (
    <SafeViewContainer style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center' }}>
      <View style={{ flex: 1 }} />

      <Text animation="fadeInUp" style={{ fontFamily: 'Questrial', fontWeight: '600', fontSize: 42, color: '#6186ff' }}>
        Wallet 3
      </Text>
      <Text animation="fadeInUp" delay={500} style={{ color: secondaryFontColor, fontSize: 12, fontWeight: '500' }}>
        A Secure Wallet for Web3
      </Text>

      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <Button
          title={t('land-welcome-import-wallet')}
          onPress={() => navigation.navigate('ImportWallet')}
          themeColor={themeColor}
          style={{ marginBottom: 12 }}
          txtStyle={{ textTransform: 'none' }}
          disabled={!read}
          reverse
        />

        <Button
          title={t('land-welcome-create-wallet')}
          onPress={() => navigation.navigate('CreateWallet')}
          txtStyle={{ textTransform: 'none' }}
          disabled={!read}
        />
      </View>
      <StatusBar style="dark" />
    </SafeViewContainer>
  );
};
