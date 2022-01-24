import { Button, Loader, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { MnemonicOnce } from '../../viewmodels/MnemonicOnce';
import Networks from '../../viewmodels/Networks';
import RejectApproveButtons from '../components/RejectApproveButtons';
import i18n from '../../i18n';
import { showMessage } from 'react-native-flash-message';

export default ({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) => {
  const { t } = i18n;
  const themeColor = Networks.current.color;
  const [mnemonic] = useState(new MnemonicOnce());
  const [secret, setSecret] = useState('');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setVerified(mnemonic.setSecret(secret)), [secret]);

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

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <TextInput
        multiline={true}
        numberOfLines={5}
        placeholder={t('land-import-placeholder')}
        onChangeText={(txt) => setSecret(txt)}
        autoCapitalize="none"
        keyboardType="default"
        secureTextEntry={true}
        style={{
          height: 150,
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
  );
};
