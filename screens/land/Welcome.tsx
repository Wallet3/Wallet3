import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { Button, Loader, SafeViewContainer } from '../../components';
import { Platform, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Text, View } from 'react-native-animatable';
import { secondaryFontColor, themeColor, thirdFontColor } from '../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { startLayoutAnimation } from '../../utils/animations';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;
  const [read, setRead] = useState(false);

  return (
    <SafeViewContainer style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text animation="fadeInUp" style={{ fontFamily: 'Questrial', fontWeight: '600', fontSize: 42, color: '#6186ff' }}>
          Wallet 3
        </Text>
        <Text animation="fadeInUp" delay={500} style={{ color: secondaryFontColor, fontSize: 12, fontWeight: '500' }}>
          A Secure Wallet for Web3
        </Text>
      </View>

      {/* <View style={{ flex: 1 }} /> */}

      <View style={{ width: '100%' }}>
        <View animation="fadeInUp" style={{ flexDirection: 'row', alignItems: 'center', paddingStart: 2 }}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingBottom: 16 }}
            onPress={() => {
              startLayoutAnimation();
              setRead(!read);
            }}
          >
            <Ionicons name="checkbox" color={read ? themeColor : 'lightgrey'} />
            <Text style={{ color: thirdFontColor, marginStart: 8, marginEnd: 4 }}>{t('land-welcome-i-agree-to')}</Text>

            <TouchableOpacity onPress={() => openBrowserAsync(`https://chainbow.co.jp/tos-en.html`)}>
              <Text style={{ color: thirdFontColor, textDecorationLine: 'underline' }}>{t('land-welcome-terms-of-use')}.</Text>
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

        {read && Platform.OS === 'ios' && SignInWithApple.isAvailable ? (
          <Animated.View entering={FadeInDown.springify()} exiting={FadeOut.delay(0)} style={{ marginTop: 12 }}>
            <AppleAuthenticationButton
              buttonStyle={AppleAuthenticationButtonStyle.BLACK}
              buttonType={AppleAuthenticationButtonType.CONTINUE}
              cornerRadius={7}
              style={{ width: '100%', height: 42 }}
              onPress={() => {}}
            />
          </Animated.View>
        ) : undefined}
      </View>

      <StatusBar style="dark" />

      <Loader loading={false} message={t('msg-wait-a-moment')} />
    </SafeViewContainer>
  );
});
