import { Button, Mnemonic, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { borderColor, secondaryFontColor, thirdFontColor } from '../../constants/styles';

import App from '../../viewmodels/core/App';
import Authentication from '../../viewmodels/auth/Authentication';
import CopyableText from '../../components/CopyableText';
import { FullPasspad } from '../../modals/views/Passpad';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MnemonicOnce } from '../../viewmodels/auth/MnemonicOnce';
import { Modalize } from 'react-native-modalize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/core/Networks';
import { Portal } from 'react-native-portalize';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import modalStyle from '../../modals/styles';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../common/Modals';
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
  const { currentWallet } = App;
  const [mn] = useState(new MnemonicOnce());

  usePreventScreenCapture();

  const themeColor = Networks.current.color;

  const verify = async (passcode?: string) => {
    setRecoveryKeyPlatform(currentWallet?.signInPlatform);

    const secret = await (currentWallet?.web2SignedIn
      ? SignInWithApple.getEncodedRecoverKey(currentWallet.signInUser!, passcode)
      : currentWallet?.getSecret(passcode));

    const success = secret ? true : false;

    setAuthorized(success);

    try {
      if (success) {
        close();
        mn.setSecret(secret!);

        if (currentWallet?.isHDWallet && !currentWallet.web2SignedIn) {
          setWords(mn.secretWords);
        } else if (currentWallet?.web2SignedIn) {
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
    if (currentWallet?.isMultiSig) return;
    openGlobalPasspad({ closeOnOverlayTap: false, onAutoAuthRequest: verify, onPinEntered: verify });
    return () => mn.clean();
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
              {words.length > 0 ? t('land-create-security-tips-1') : t('land-create-security-tips-3')}
            </Text>
            {words.length > 0 && (
              <Text style={{ marginStart: 16, color: secondaryFontColor }}>{t('land-create-security-tips-2')}</Text>
            )}
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

          {(privKey || recoveryKey || words.length > 0) && (
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <QRCode
                value={privKey || recoveryKey || words.join(' ')}
                size={125}
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
        <View />
      )}
    </SafeViewContainer>
  );
});
