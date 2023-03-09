import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import AnimatedLottieView from 'lottie-react-native';
import Authentication from '../../viewmodels/auth/Authentication';
import MnemonicOnce from '../../viewmodels/auth/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/core/Networks';
import { SortWords } from '../components/SecretWords';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { logBackup } from '../../viewmodels/services/Analytics';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const { t } = i18n;
  const [verified, setVerified] = useState(false);
  const { textColor } = Theme;

  return (
    <SafeViewContainer style={{ flex: 1 }} paddingHeader>
      {verified ? (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }} />

          <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
            <AnimatedLottieView autoPlay autoSize source={require('../../assets/animations/bubble-explosion.json')} />
            <AnimatedLottieView
              autoPlay
              loop={false}
              source={require('../../assets/animations/success.json')}
              style={{ position: 'absolute', marginTop: -12, marginRight: -12, width: 220, height: 220 }}
            />
          </View>

          <View style={{ flex: 1 }} />

          <Button
            title="OK"
            themeColor={Networks.current.color}
            onPress={() => navigation.popToTop()}
            txtStyle={{ textTransform: 'uppercase' }}
          />
        </View>
      ) : (
        <View>
          <Text style={{ color: textColor }}>{t('land-backup-sort-words')}</Text>
          <SortWords
            color={textColor}
            words={MnemonicOnce.secretWords}
            onVerified={(v) => {
              setVerified(v);
              v && logBackup();
            }}
          />
        </View>
      )}
    </SafeViewContainer>
  );
});
