import { Button, Coin, SafeViewContainer } from '../../components';
import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AnimateNumber from 'react-native-animate-number';
import BackButton from '../components/BackButton';
import { BaseTransaction } from '../../viewmodels/transferring/BaseTransaction';
import Fire from '../../assets/icons/app/fire.svg';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import Themes from '../../screens/settings/Themes';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import Tokenlist from './Tokenlist';
import TxException from '../components/TxException';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
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
        autoFocus
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
