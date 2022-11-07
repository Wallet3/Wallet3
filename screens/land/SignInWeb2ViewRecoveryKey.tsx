import { Button, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor } from '../../constants/styles';

import Authentication from '../../viewmodels/auth/Authentication';
import CopyableText from '../../components/CopyableText';
import { LandScreenStack } from '../navigations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import SignInWithGoogle from '../../viewmodels/auth/SignInWithGoogle';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation, route }: NativeStackScreenProps<LandScreenStack, 'ViewRecoveryKey'>) => {
  const { t } = i18n;
  const [countdown, setCountdown] = useState(10);
  const platform = route.params as 'apple' | 'google' | undefined;

  useEffect(() => {
    let timer: NodeJS.Timer;

    const refreshTimer = () => {
      setCountdown((pre) => Math.max(0, pre - 1));
      timer = setTimeout(() => refreshTimer(), 1000);
    };

    refreshTimer();

    return () => {
      clearTimeout(timer);
    };
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
        <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>{t('land-sign-in-web2-tips-1')}</Text>
        <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>{t('land-sign-in-web2-tips-2')}</Text>
        <Text style={{ marginStart: 16, color: secondaryFontColor }}>{t('land-sign-in-web2-tips-3')}</Text>
      </View>

      <View style={{ borderColor, borderWidth: 1, borderRadius: 7, padding: 12, paddingEnd: 24 }}>
        <CopyableText
          txtLines={1}
          copyText={(platform === 'apple' ? SignInWithApple : SignInWithGoogle).recoveryKey}
          iconColor={'black'}
          iconStyle={{ marginStart: 6 }}
        />
      </View>

      <View style={{ marginVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
        <QRCode
          value={(platform === 'apple' ? SignInWithApple : SignInWithGoogle).recoveryKey}
          size={180}
          backgroundColor="transparent"
          enableLinearGradient
          logoBorderRadius={7}
          logoSize={29}
          linearGradient={['rgb(134, 65, 244)', 'rgb(66, 194, 244)']}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Button
        disabled={countdown > 0}
        title={countdown > 0 ? `(${countdown}) ${t('land-sign-in-web2-i-have-saved')}` : t('land-sign-in-web2-i-have-saved')}
        txtStyle={{ textTransform: 'none' }}
        onPress={() => {
          Authentication.setUserSecretsVerified(true);
          navigation.navigate('SetupPasscode');
        }}
      />
    </SafeViewContainer>
  );
});
