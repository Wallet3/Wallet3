import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onBack?: () => void;
  decodedFunc?: DecodedFunc;
  themeColor?: string;
}

export default observer(({ onBack, decodedFunc, themeColor }: Props) => {
  const { borderColor, thirdTextColor, isLightMode } = Theme;

  const txtStyle = { color: thirdTextColor };
  const tableHeaderTxtStyle: any = { ...txtStyle, fontSize: 12, fontWeight: '600' };

  const { t } = i18n;

  return (
    <SafeViewContainer>
      <View
        style={{
          ...styles.modalTitleContainer,
          justifyContent: 'flex-end',
          borderBottomWidth: 0,
          borderBottomColor: borderColor,
        }}
      >
        <Ionicons name="code-slash-outline" size={12} color={themeColor} style={{ marginStart: 12 }} />
        <Text style={{ ...styles.modalTitle, fontSize: 12, color: themeColor, marginStart: 8, marginEnd: 10 }}>
          {t('modal-func-review-title')}
        </Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={{ padding: 10, paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor,
          borderRadius: 10,
          marginBottom: 12,
          backgroundColor: isLightMode ? '#f9f9f9a0' : undefined,
        }}
      >
        <Text style={txtStyle}>{t('modal-func-review-function')}:</Text>
        <Text style={{ ...txtStyle, marginTop: 2 }}>{`${decodedFunc?.fullFunc}`}</Text>
        <Text style={{ ...txtStyle, marginTop: 20 }}>{t('modal-func-review-method-id')}:</Text>
        <Text style={{ ...txtStyle, marginTop: 2, marginBottom: 20 }}>{`${decodedFunc?.methodID}`}</Text>

        {(decodedFunc?.inputs?.length ?? 0) > 0 && (
          <Text style={{ ...txtStyle, marginBottom: 4 }}>{t('modal-func-review-inputs')}:</Text>
        )}

        {(decodedFunc?.inputs?.length ?? 0) > 0 && (
          <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
            <Text style={{ ...tableHeaderTxtStyle, width: 24 }}>#</Text>
            <Text style={{ ...tableHeaderTxtStyle, width: 72 }}>{t('modal-func-review-input-name')}</Text>
            <Text style={{ ...tableHeaderTxtStyle, width: 72 }}>{t('modal-func-review-input-type')}</Text>
            <Text style={{ ...tableHeaderTxtStyle, flex: 1 }}>{t('modal-func-review-input-value')}</Text>
          </View>
        )}

        {decodedFunc?.inputs.map((input, index) => {
          const param = decodedFunc?.params[index];

          return (
            <View
              key={`${index}_${input.name}`}
              style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: borderColor, paddingVertical: 4 }}
            >
              <Text style={{ ...txtStyle, width: 24 }}>{index}</Text>
              <Text style={{ ...txtStyle, width: 72, paddingEnd: 10 }} numberOfLines={1}>
                {input.name}
              </Text>
              <Text style={{ ...txtStyle, width: 72, paddingEnd: 10 }} numberOfLines={1}>
                {input.type}
              </Text>
              <Text style={{ ...txtStyle, flex: 1 }} numberOfLines={1} ellipsizeMode="middle">
                {param?.toString?.()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Button title="OK" txtStyle={{ textTransform: 'none' }} themeColor={themeColor} onPress={onBack} />
    </SafeViewContainer>
  );
});
