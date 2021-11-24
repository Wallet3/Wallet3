import React from 'react';
import { Text } from 'react-native';
import i18n from '../../i18n';

export default () => {
  const { t } = i18n;
  return (
    <Text style={{ color: 'crimson', textAlign: 'right', fontSize: 12, fontWeight: '600', marginEnd: 18, marginTop: 6 }}>
      {t('tip-insufficient-funds')}
    </Text>
  );
};
