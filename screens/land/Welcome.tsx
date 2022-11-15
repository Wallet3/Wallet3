import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { Button, Loader, SafeViewContainer } from '../../components';
import { Platform, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native-animatable';
import { secondaryFontColor, themeColor, thirdFontColor } from '../../constants/styles';

import { G } from '../../assets/3rd';
import { Ionicons } from '@expo/vector-icons';
import { LandScreenStack } from '../navigations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignInType } from '../../viewmodels/auth/SignInWithWeb2';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import SignInWithGoogle from '../../viewmodels/auth/SignInWithGoogle';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { showMessage } from 'react-native-flash-message';
import { startLayoutAnimation } from '../../utils/animations';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;
  const [read, setRead] = useState(false);

  const jumpTo = async (signInPlatform: 'apple' | 'google') => {
    let signInResult: SignInType
    if(signInPlatform==='apple'){
      signInResult = await SignInWithApple.signIn()
    }else{
      signInResult = await SignInWithGoogle.signIn()
    }
    console.log(signInResult)
    if (!signInResult) {
      showMessage({ message: t('msg-sign-in-web2-failed') });
      return;
    }

    let to: any = '';
    switch (signInResult) {
      case SignInType.new_user:
        to = 'ViewRecoveryKey';
        break;
      case SignInType.recover_key_exists:
        to = 'SetupPasscode';
        break;
      case SignInType.recover_key_not_exists:
        to = 'SetRecoveryKey';
        break;
      case SignInType.failed:
        showMessage({ message: t('msg-sign-in-web2-failed') });
        return;
    }

    console.log(to, signInPlatform)
    navigation.navigate(to, signInPlatform);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      SignInWithApple.init();
    }

    SignInWithGoogle.init();
  }, []);

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
              onPress={() => jumpTo('apple')}
            />
          </Animated.View>
        ) : undefined}

        {read && SignInWithGoogle.isAvailable ? (
          <Animated.View entering={FadeInDown.delay(150).springify()} exiting={FadeOut.delay(100)} style={{ marginTop: 12 }}>
            <Button
              reverse
              icon={() => <G width={12} />}
              themeColor="#4285F4"
              title={t('land-sign-in-continue-with-google')}
              txtStyle={{ textTransform: 'none' }}
              onPress={() => jumpTo('google')}
            />
          </Animated.View>
        ) : undefined}
      </View>

      <StatusBar style="dark" />

      <Loader loading={SignInWithApple.loading || SignInWithGoogle.loading} message={t('msg-wait-a-moment')} />
    </SafeViewContainer>
  );
});
