import { Text, View } from 'react-native';

import { ButtonV2 } from '../../../../components';
import { FadeInDownView } from '../../../../components/animations';
import IllustrationAsk from '../../../../assets/illustrations/misc/ask.svg';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { useOptimizedSafeBottom } from '../../../../utils/hardware';
import { warningColor } from '../../../../constants/styles';

interface Props {
  onDone: () => void;
  message: string;
  msgAlign?: 'center' | 'auto';
}

export default ({ message, onDone, msgAlign }: Props) => {
  const safeBottom = useOptimizedSafeBottom();
  const { t } = i18n;
  const { textColor } = Theme;

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <IllustrationAsk width={150} height={150} />
        <Text style={{ maxWidth: 270, textAlign: msgAlign ?? 'center', marginVertical: 24, color: textColor }}>{message}</Text>
      </View>

      <FadeInDownView delay={300}>
        <ButtonV2
          onPress={onDone}
          themeColor={warningColor}
          style={{ marginBottom: safeBottom }}
          title={t('button-confirm')}
          icon={() => <Ionicons name="trash" color={'#fff'} size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};
