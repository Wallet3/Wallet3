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
import { useFonts } from 'expo-font';

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
        <View animation="fadeInUp" style={{ flexDirection: 'row', alignItems: 'center', paddingStart: 2 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => setRead(!read)}
          >
            <Ionicons name="checkbox" color={read ? themeColor : 'lightgrey'} />
            <Text style={{ color: thirdFontColor, marginStart: 8 }}>I have read the </Text>

            <TouchableOpacity onPress={() => openBrowserAsync(`https://chainbow.io/tos-en`)}>
              <Text style={{ color: thirdFontColor, textDecorationLine: 'underline' }}>Terms of Use.</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View animation="fadeInUp" delay={300}>
          <Button
            title={t('land-welcome-import-wallet')}
            onPress={() => navigation.navigate('ImportWallet')}
            themeColor={themeColor}
            style={{ marginBottom: 12 }}
            txtStyle={{ textTransform: 'none' }}
            disabled={!read}
            reverse
          />
        </View>

        <View animation="fadeInUp" delay={500}>
          <Button
            title={t('land-welcome-create-wallet')}
            onPress={() => navigation.navigate('CreateWallet')}
            txtStyle={{ textTransform: 'none' }}
            disabled={!read}
          />
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeViewContainer>
  );
};
