import { Button, Placeholder, SafeViewContainer } from '../../components';
import { secureColor, themeColor } from '../../constants/styles';

import IllustrationPartying from '../../assets/illustrations/misc/partying.svg';
import React from 'react';
import { View } from 'react-native';
import i18n from '../../i18n';
import { useNavigation } from '@react-navigation/native';

export default (props) => {
  const { t } = i18n;
  const navigation = useNavigation<any>();

  return (
    <SafeViewContainer style={{ flex: 1, backgroundColor: '#fff' }}>
      <Placeholder />
      <View>
        <IllustrationPartying width={150} height={150} style={{ alignSelf: 'center' }} />
      </View>
      <Placeholder />

      <Button
        title={t('land-welcome-import-wallet')}
        onPress={() => navigation.navigate('ImportWallet')}
        themeColor={secureColor}
        style={{ marginBottom: 12 }}
        txtStyle={{ textTransform: 'none' }}
        reverse
      />

      <Button title={t('button-start')} onPress={() => {}} themeColor={secureColor} txtStyle={{ textTransform: 'none' }} />
    </SafeViewContainer>
  );
};
