import * as ethers from 'ethers';

import React, { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor, themeColor } from '../../constants/styles';

import Authentication from '../../viewmodels/auth/Authentication';
import { Button } from '../../components';
import { LandScreenStack } from '../navigations';
import MessageKeys from '../../common/MessageKeys';
import MnemonicOnce from '../../viewmodels/auth/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { decode } from 'js-base64';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useHeaderHeight } from '@react-navigation/elements';

export default observer(({ navigation }: NativeStackScreenProps<LandScreenStack, 'Backup'>) => {
  const { t } = i18n;
  const headerHeight = useHeaderHeight();
  const { top, bottom } = useSafeAreaInsets();

  const [mnemonic, setMnemonic] = React.useState('');
  const [verified, setVerified] = React.useState(false);

  useEffect(() => {
    const success = MnemonicOnce.setSecret(mnemonic);
    setVerified(success);
    Authentication.setUserSecretsVerified(success);
  }, [mnemonic]);

  useEffect(() => {
    MnemonicOnce.clean();

    PubSub.subscribe(MessageKeys.CodeScan_wallet3sync, (_, { data }: { data: string }) => {
      const encoded = data.substring(12);
      const decoded = decode(encoded).replaceAll(',', ' ').trim();

      if (!ethers.utils.isValidMnemonic(decoded)) return;
      MnemonicOnce.setSecret(decoded);
      navigation.navigate('SetupPasscode');
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.CodeScan_wallet3sync);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ flex: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingBottom: bottom > 0 ? 0 : 16,
          paddingTop: Math.max(44, headerHeight - top),
          flex: 1,
          backgroundColor: 'transparent',
        }}
      >
        <TextInput
          multiline={true}
          numberOfLines={5}
          placeholder={t('land-import-placeholder')}
          onChangeText={(txt) => setMnemonic(txt)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          secureTextEntry={true}
          style={{
            height: 200,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: themeColor,
            borderRadius: 10,
            padding: 8,
            paddingVertical: 24,
            fontSize: 16,
          }}
        />

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
            onChangeText={(txt) => MnemonicOnce.setDerivationPath(txt)}
          />
        </View>

        <View style={{ flex: 1 }} />

        <Button
          reverse
          title={t('land-import-button-sync')}
          onPress={() => navigation.navigate('QRScan')}
          style={{ marginBottom: 12 }}
          themeColor={themeColor}
          txtStyle={{ textTransform: 'none' }}
        />

        <Button title={t('button-next')} disabled={!verified} onPress={() => navigation.navigate('SetupPasscode')} />
      </ScrollView>
    </SafeAreaView>
  );
});
