import Button from '../components/Button';
import { FadeInRightView } from '../../../components/animations';
import React from 'react';
import Welcome from '../components/Introduction';
import i18n from '../../../i18n';

export default ({ onNext }: { onNext?: () => void }) => {
  const { t } = i18n;

  return (
    <FadeInRightView style={{ flex: 1 }}>
      <Welcome />
      <Button title={t('button-start')} onPress={onNext} />
    </FadeInRightView>
  );
};
