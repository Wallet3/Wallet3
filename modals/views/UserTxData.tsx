import { Button, SafeViewContainer } from '../../components';
import { Text, TextInput, View } from 'react-native';

import BackButton from '../components/BackButton';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onBack?: () => void;
  vm: TokenTransferring;
  themeColor?: string;
}

export default observer(({ vm, onBack, themeColor }: Props) => {
  const { t } = i18n;
  const { borderColor, isLightMode } = Theme;

  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={onBack} color={themeColor} />
        <Text style={styles.navTitle}>{t('modal-review-message')}</Text>
      </View>

      <TextInput
        multiline={true}
        placeholder={'Hello World'}
        defaultValue={vm.userTxData}
        onChangeText={(txt) => vm.setUserTxData(txt)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        style={{
          textAlignVertical: 'top',
          borderWidth: 1,
          backgroundColor: isLightMode ? '#f9f9f9a0' : undefined,
          borderColor,
          borderRadius: 10,
          padding: 8,
          paddingVertical: 24,
          fontSize: 16,
          flex: 1,
          marginBottom: 16,
          marginTop: 8,
        }}
      />

      <Button
        title="OK"
        txtStyle={{ textTransform: 'uppercase' }}
        onPress={onBack}
        themeColor={themeColor}
        disabled={!vm.isValidGas}
      />
    </SafeViewContainer>
  );
});
