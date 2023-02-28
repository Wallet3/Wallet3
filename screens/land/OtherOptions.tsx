import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
} from 'expo-apple-authentication';
import { Button, Loader, SafeViewContainer } from '../../components';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native-animatable';
import { secondaryFontColor, themeColor } from '../../constants/styles';

import { FadeInDownView } from '../../components/animations';
import { G } from '../../assets/3rd';
import IllustrationVault from '../../assets/illustrations/misc/vault.svg';
import { LandScreenStack } from '../navigations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { SignInType } from '../../viewmodels/auth/SignInWithWeb2';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import SignInWithGoogle from '../../viewmodels/auth/SignInWithGoogle';
import { StatusBar } from 'expo-status-bar';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Welcome'>) => {
  const { t } = i18n;

  const jumpTo = (signInPlatform: 'apple' | 'google', signInResult?: SignInType) => {
    if (!signInResult) {
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
        <FadeInDownView delay={200}>
          <IllustrationVault width={200} height={200} />
        </FadeInDownView>
        <Text animation="fadeInUp" delay={500} style={{ color: secondaryFontColor, fontSize: 12, fontWeight: '500' }}>
          Secure, Simple, Powerful
        </Text>
      </View>

      <View style={{ width: '100%' }}>
        <View animation="fadeInUp" delay={300}>
          <Button
            title={t('land-welcome-import-wallet')}
            onPress={() => navigation.navigate('ImportWallet')}
            themeColor={themeColor}
            style={{ marginBottom: 12 }}
            txtStyle={{ textTransform: 'none' }}
            reverse
          />
        </View>

        <View animation="fadeInUp" delay={500}>
          <Button
            title={t('land-welcome-create-wallet')}
            onPress={() => navigation.navigate('CreateWallet')}
            txtStyle={{ textTransform: 'none' }}
          />
        </View>

        {Platform.OS === 'ios' && SignInWithApple.isAvailable ? (
          <Animated.View entering={FadeInDown.springify()} exiting={FadeOut.delay(0)} style={{ marginTop: 12 }}>
            <AppleAuthenticationButton
              buttonStyle={AppleAuthenticationButtonStyle.BLACK}
              buttonType={AppleAuthenticationButtonType.CONTINUE}
              cornerRadius={7}
              style={{ width: '100%', height: 42 }}
              onPress={async () => jumpTo('apple', await SignInWithApple.signIn())}
            />
          </Animated.View>
        ) : undefined}

        {SignInWithGoogle.isAvailable ? (
          <Animated.View entering={FadeInDown.delay(150).springify()} exiting={FadeOut.delay(100)} style={{ marginTop: 12 }}>
            <Button
              reverse
              icon={() => <G width={12} />}
              themeColor="#4285F4"
              title={t('land-sign-in-continue-with-google')}
              txtStyle={{ textTransform: 'none' }}
              onPress={async () => jumpTo('google', await SignInWithGoogle.signIn())}
            />
          </Animated.View>
        ) : undefined}
      </View>

      <StatusBar style="dark" />

      <Loader loading={SignInWithApple.loading || SignInWithGoogle.loading} message={t('msg-wait-a-moment')} />
    </SafeViewContainer>
  );
});
