import { Button, Coin, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import { Ionicons } from '@expo/vector-icons';
import MultiSourceImage from '../../components/MultiSourceImage';
import { PreExecResult } from '../../common/apis/Debank';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { formatCurrency } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onBack?: () => void;
  themeColor?: string;
  preview?: PreExecResult;
}

export default observer(({ themeColor, onBack, preview }: Props) => {
  const { borderColor, thirdTextColor, isLightMode, foregroundColor } = Theme;

  const txtStyle = { color: thirdTextColor };
  const itemValueStyle: any = { ...txtStyle, fontSize: 16, fontWeight: '500', marginHorizontal: 8, marginStart: 12 };
  const itemContainer: any = {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor,
    paddingBottom: 6,
  };

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
        <Ionicons name="trail-sign-outline" size={12} color={themeColor} style={{ marginStart: 12 }} />
        <Text style={{ ...styles.modalTitle, fontSize: 12, color: themeColor, marginStart: 8, marginEnd: 10 }}>
          {t('modal-balance-change-preview-title')}
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
        <Text style={{ ...txtStyle, marginBottom: 8 }}>{t('modal-review-send')}:</Text>

        {preview?.send_token_list?.map((t) => (
          <View key={`${t.address}_${t.symbol}`} style={itemContainer}>
            <Coin address={t.address} symbol={t.symbol} chainId={t.chainId} size={25} />
            <Text style={itemValueStyle} numberOfLines={1}>{`-${formatCurrency(t.amount, '')} ${t.symbol}`}</Text>
          </View>
        ))}

        {preview?.send_nft_list?.map((nft) => (
          <View key={`${nft.content}_${nft.amount}_${nft.content_type}`} style={itemContainer}>
            <MultiSourceImage
              sourceTypes={[]}
              uriSources={[nft.content]}
              style={{ width: 25, height: 25, borderRadius: 5 }}
              loadingIconSize={10}
            />

            <Text style={itemValueStyle} numberOfLines={1}>{`-${nft.amount} ${nft.name}`}</Text>
          </View>
        ))}

        <Text style={{ ...txtStyle, marginVertical: 8 }}>{t('modal-review-receive')}:</Text>

        {preview?.receive_token_list?.map((t) => (
          <View key={`${t.address}_${t.symbol}`} style={itemContainer}>
            <Coin address={t.address} symbol={t.symbol} chainId={t.chainId} size={25} />
            <Text style={itemValueStyle} numberOfLines={1}>{`+${formatCurrency(t.amount, '')} ${t.symbol}`}</Text>
          </View>
        ))}

        {preview?.receive_nft_list?.map((nft) => (
          <View key={`${nft.content}_${nft.amount}_${nft.content_type}`} style={itemContainer}>
            <MultiSourceImage
              sourceTypes={[]}
              uriSources={[nft.content]}
              style={{ width: 25, height: 25, borderRadius: 5, backgroundColor: borderColor }}
              loadingIconSize={10}
            />

            <Text style={itemValueStyle} numberOfLines={1}>{`+${nft.amount} ${nft.name}`}</Text>
          </View>
        ))}
      </ScrollView>

      <Button title="OK" txtStyle={{ textTransform: 'none' }} themeColor={themeColor} onPress={onBack} />
    </SafeViewContainer>
  );
});
