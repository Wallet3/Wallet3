import { Button, Loader, SafeViewContainer } from '../../components';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { borderColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { MnemonicOnce } from '../../viewmodels/MnemonicOnce';
import Networks from '../../viewmodels/Networks';
import RejectApproveButtons from '../components/RejectApproveButtons';
import SecretScan from './SecretScan';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { decode } from 'js-base64';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';
import { useNavigation } from '@react-navigation/native';

export default ({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) => {
  const { t } = i18n;
  const themeColor = Networks.current.color;
  const [mnemonic] = useState(new MnemonicOnce());
  const [secret, setSecret] = useState<string>();
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);

  const [swiperIndex, setSwiperIndex] = useState(0);
  const { borderColor, secondaryTextColor, textColor, foregroundColor } = Theme;
  const swiper = useRef<Swiper>(null);

  useEffect(() => setVerified(mnemonic.setSecret(secret || '')), [secret]);

  const importWallet = async () => {
    if (!verified) return;

    setBusy(true);

    setTimeout(async () => {
      const key = await mnemonic.save();

      if (key) {
        await App.addWallet(key);
        onDone?.();
      } else {
        showMessage({ message: 'msg-failed-to-import-wallet', type: 'warning' });
      }

      setBusy(false);
    }, 0);
  };

  const onData = (secret: string) => {
    setSecret(secret);

    setTimeout(() => {
      if (!verified) return;
      swiper.current?.scrollTo(0);
    }, 0);
  };

  return (
    <Swiper
      ref={swiper}
      showsPagination={false}
      showsButtons={false}
      scrollEnabled={false}
      onIndexChanged={(index) => setSwiperIndex(index)}
      loop={false}
      automaticallyAdjustContentInsets
    >
      <SafeViewContainer style={{ padding: 16 }}>
        <View style={{ position: 'relative' }}>
          <TextInput
            multiline={true}
            numberOfLines={5}
            placeholder={t('land-import-placeholder')}
            onChangeText={(txt) => setSecret(txt)}
            defaultValue={secret}
            autoCapitalize="none"
            keyboardType="default"
            secureTextEntry={true}
            placeholderTextColor={secondaryTextColor}
            style={{
              height: 150,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: themeColor,
              borderRadius: 10,
              padding: 8,
              paddingVertical: 24,
              fontSize: 16,
              color: foregroundColor,
            }}
          />

          <TouchableOpacity
            style={{ position: 'absolute', bottom: 0, right: 0, padding: 8, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => swiper.current?.scrollTo(1)}
          >
            <Ionicons name="scan-outline" size={21} color={themeColor} />
            <View style={{ height: 1.2, position: 'absolute', width: 13.5, left: 11, backgroundColor: themeColor }} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            paddingBottom: 2,
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: 17, color: secondaryFontColor }}>{t('land-import-derivation-path')}</Text>
          <TextInput
            style={{ fontSize: 17, color: themeColor }}
            defaultValue={`m/44'/60'/0'/0/0`}
            autoCorrect={false}
            onChangeText={(txt) => mnemonic.setDerivationPath(txt)}
          />
        </View>

        <View style={{ flex: 1 }} />

        <RejectApproveButtons
          themeColor={themeColor}
          onReject={onCancel}
          onApprove={importWallet}
          rejectTitle={t('button-cancel')}
          approveTitle={t('button-done')}
          disabledApprove={!verified}
        />

        <Loader loading={busy} message={t('land-passcode-encrypting')} />
      </SafeViewContainer>

      <SecretScan onData={onData} onBack={() => swiper.current?.scrollTo(0)} enabled={swiperIndex === 1} />
    </Swiper>
  );
};
