import { FadeInDownView, FadeInUpView } from '../../components/animations';

import BackableScrollTitles from '../components/BackableScrollTitles';
import Button from '../tss/components/Button';
import IllustrationUpgrade from '../../assets/illustrations/misc/upgrade.svg';
import ModalRootContainer from '../core/ModalRootContainer';
import React from 'react';
import { Text } from 'react-native';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';

export default observer(({ onDone }: { onDone: () => void }) => {
  const { t } = i18n;
  const navigation = useNavigation<any>();

  const goToBackup = () => {
    navigation.navigate('MultiSig');
  };

  return (
    <ModalRootContainer style={{}}>
      <BackableScrollTitles titles={[t('multi-sig-modal-title-welcome')]} txtStyle={{ color: secureColor }} />

      <FadeInUpView style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} delay={500}>
        <IllustrationUpgrade width={150} height={150} />
        <Text style={{ color: secureColor, maxWidth: 300, fontWeight: '500', marginTop: 16 }}>
          {t('multi-sig-modal-msg-upgrade-tip')}
        </Text>
      </FadeInUpView>

      <FadeInDownView delay={700}>
        <Button
          themeColor={secureColor}
          title={t('modal-siwe-see-details')}
          style={{ marginHorizontal: 0 }}
          txtStyle={{ textTransform: 'none' }}
          onPress={() => {
            onDone();
            goToBackup();
          }}
        />
      </FadeInDownView>
    </ModalRootContainer>
  );
});
