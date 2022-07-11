import { StyleProp, Text, ViewStyle } from 'react-native';

import React from 'react';
import i18n from '../../i18n';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default ({ style }: Props) => {
  const { t } = i18n;
  return (
    <Text
      style={{
        color: 'crimson',
        textAlign: 'right',
        fontSize: 12,
        fontWeight: '600',
        marginEnd: 18,
        marginTop: 6,
        ...(style || ({} as any)),
      }}
    >
      {t('tip-insufficient-funds')}
    </Text>
  );
};
