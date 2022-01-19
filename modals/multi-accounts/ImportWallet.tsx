import { Button, SafeViewContainer } from '../../components';
import { Text, TextInput, View } from 'react-native';
import { borderColor, secondaryFontColor } from '../../constants/styles';

import Networks from '../../viewmodels/Networks';
import React from 'react';
import RejectApproveButtons from '../components/RejectApproveButtons';
import i18n from '../../i18n';

export default ({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) => {
  const { t } = i18n;
  const themeColor = Networks.current.color;

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <TextInput
        multiline={true}
        numberOfLines={5}
        placeholder={t('land-import-placeholder')}
        // onChangeText={(txt) => setMnemonic(txt)}
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
          //   onChangeText={(txt) => MnemonicOnce.setDerivationPath(txt)}
        />
      </View>

      <View style={{ flex: 1 }} />

      {/* <Button reverse title={t('land-import-button-sync')} themeColor={themeColor} /> */}
      <RejectApproveButtons themeColor={themeColor} onReject={onCancel} rejectTitle={t('button-cancel')} />
    </SafeViewContainer>
  );
};
