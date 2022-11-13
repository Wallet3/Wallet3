import { Button, Mnemonic, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { borderColor, secondaryFontColor, styles, thirdFontColor } from '../../constants/styles';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import CopyableText from '../../components/CopyableText';
import { FullPasspad } from '../../modals/views/Passpad';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MnemonicOnce from '../../viewmodels/auth/MnemonicOnce';
import { Modalize } from 'react-native-modalize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/core/Networks';
import { Portal } from 'react-native-portalize';
import QRCode from 'react-native-qrcode-svg';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { usePreventScreenCapture } from 'expo-screen-capture';

export default observer(({ navigation }: NativeStackScreenProps<any, never>) => {
  const { t } = i18n;
  const { ref: authModalRef, open, close } = useModalize();
  const [retried, setRetried] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [privKey, setPrivKey] = useState<string>();
  const [recoveryKey, setRecoveryKey] = useState<string>();
  const [recoveryKeyPlatform, setRecoveryKeyPlatform] = useState<string>();
  const { textColor } = Theme;

  usePreventScreenCapture();

  const themeColor = Networks.current.color;

  const verify = async (passcode?: string) => {
    const { wallet } = App.findWallet(App.currentAccount?.address || '') || {};
    setRecoveryKeyPlatform(wallet?.signInPlatform);

    const secret = await (wallet?.web2SignedIn
      ? SignInWithApple.getEncodedRecoverKey(wallet.signInUser!, passcode)
      : wallet?.getSecret(passcode));

    const success = secret ? true : false;

    setAuthorized(success);

    try {
      if (success) {
        close();
        MnemonicOnce.setSecret(secret!);

        if (wallet?.isHDWallet && !wallet.web2SignedIn) {
          setWords(MnemonicOnce.secretWords);
        } else if (wallet?.web2SignedIn) {
          setRecoveryKey(secret!);
        } else {
          setPrivKey(secret!);
        }
      } else {
        setRetried((p) => p + 1);
      }

      return success;
    } finally {
      if (retried > 3) navigation.pop();
    }
  };

  useEffect(() => {
    setTimeout(() => open(), 0);
    if (Authentication.biometricType) verify();

    return () => MnemonicOnce.clean();
  }, []);

  return (
    <SafeViewContainer paddingHeader includeTopPadding>
      {authorized ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: -12, marginBottom: -8 }}>
            <MaterialCommunityIcons name="shield-key" size={64} color={'#61D800'} />
          </View>

          <View style={{ marginVertical: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: themeColor, marginBottom: 8 }}>
              {t('land-create-security-tips')}
            </Text>
            <Text style={{ marginStart: 16, marginBottom: 8, color: secondaryFontColor }}>
              {t('land-create-security-tips-1')}
            </Text>
            <Text style={{ marginStart: 16, color: secondaryFontColor }}>{t('land-create-security-tips-2')}</Text>
          </View>

          {words.length > 0 && <Mnemonic phrase={words} color={textColor} />}

          {recoveryKey || privKey ? (
            <Text
              style={{ marginVertical: 8, color: themeColor, fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}
            >
              {`${t(recoveryKey ? 'land-sign-in-web2-recovery-key' : 'settings-security-backup-private-key')} ${
                recoveryKeyPlatform ? `(${recoveryKeyPlatform})` : ''
              }`}
            </Text>
          ) : undefined}

          {(privKey || recoveryKey) && (
            <View style={{ borderColor, borderWidth: 1, borderRadius: 7, padding: 12, paddingEnd: 24 }}>
              <CopyableText
                copyText={privKey || recoveryKey!}
                txtLines={1}
                iconColor={thirdFontColor}
                txtStyle={{ color: thirdFontColor }}
                iconStyle={{ marginStart: 6 }}
              />
            </View>
          )}

          {(privKey || recoveryKey) && (
            <View style={{ margin: 36, alignItems: 'center' }}>
              <QRCode
                value={privKey || recoveryKey}
                size={180}
                backgroundColor="transparent"
                enableLinearGradient
                logoBorderRadius={7}
                logoSize={29}
                linearGradient={['rgb(134, 65, 244)', 'rgb(66, 194, 244)']}
              />
            </View>
          )}

          <View style={{ flex: 1 }} />

          {words.length > 0 && (
            <Button
              title={t('settings-security-backup-button-verify')}
              themeColor={themeColor}
              onPress={() => navigation.navigate('VerifySecret')}
            />
          )}
        </View>
      ) : (
        <View></View>
      )}

      <Portal>
        <Modalize
          ref={authModalRef}
          disableScrollIfPossible
          adjustToContentHeight
          closeOnOverlayTap={false}
          withHandle={false}
          panGestureEnabled={false}
          panGestureComponentEnabled={false}
          modalStyle={styles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <FullPasspad
            appAvailable={true}
            themeColor={themeColor}
            height={420}
            borderRadius={6}
            failedAttempts={Authentication.failedAttempts}
            onCodeEntered={(code) => verify(code)}
          />
        </Modalize>
      </Portal>
    </SafeViewContainer>
  );
});
