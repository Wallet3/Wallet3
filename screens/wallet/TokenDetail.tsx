import * as shape from 'd3-shape';

import { Button, Coin, Skeleton } from '../../components';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontColor, thirdFontColor } from '../../constants/styles';

import { FontAwesome } from '@expo/vector-icons';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/Tokens';
import { LineChart } from 'react-native-svg-charts';
import Theme from '../../viewmodels/settings/Theme';
import { TokenData } from '../../viewmodels/services/TokenData';
import { UserToken } from '../../viewmodels/services/TokensMan';
import { formatCurrency } from '../../utils/formatter';
import i18n from '../../i18n';
import numeral from 'numeral';
import { observer } from 'mobx-react-lite';

interface Props {
  token?: IToken;
  network: INetwork;
  themeColor?: string;
  onSendPress?: (token?: IToken) => void;
}

const Gradient = () => (
  <Defs key={'gradient'}>
    <LinearGradient id={'gradient'} x1={'0'} y1={'0%'} x2={'100%'} y2={'0%'}>
      <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
      <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
    </LinearGradient>
  </Defs>
);

export default observer(({ token, themeColor, onSendPress, network }: Props) => {
  const [vm] = useState<TokenData>(new TokenData({ token: token!, network }));
  const { t } = i18n;
  const { backgroundColor, textColor, foregroundColor } = Theme;

  return (
    <View style={{ padding: 16, backgroundColor, borderRadius: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Coin
          chainId={network.chainId}
          address={token?.address || ''}
          symbol={token?.symbol}
          size={39}
          iconUrl={token?.iconUrl}
        />

        <View style={{ marginStart: 16 }}>
          <Text style={{ fontWeight: '500', fontSize: 19, color: foregroundColor }} numberOfLines={1}>
            {token?.symbol}
          </Text>
          {vm.loading ? (
            <Skeleton style={{ height: 14, marginTop: 2 }} />
          ) : (
            <Text style={{ fontSize: 14, color: vm.priceChangePercentIn24 > 0 ? 'yellowgreen' : 'crimson' }} numberOfLines={1}>
              {`$ ${vm.price} (${
                vm.priceChangePercentIn24 > 0
                  ? '+' + vm.priceChangePercentIn24.toFixed(2)
                  : vm.priceChangePercentIn24.toFixed(2)
              }% 24h)`}
            </Text>
          )}
        </View>
      </View>

      <LineChart
        style={{ height: 200, marginHorizontal: -16, marginVertical: 16 }}
        data={vm.historyPrices}
        contentInset={{ top: 20, bottom: 20 }}
        curve={shape.curveNatural}
        animate
        svg={{
          strokeWidth: 3,
          stroke: 'url(#gradient)',
        }}
      >
        <Gradient />
      </LineChart>

      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={styles.subTitle}>{t('modal-token-details-value')}</Text>
        <Text style={styles.subTitle}>{t('modal-token-details-balance')}</Text>
      </View>

      <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Text style={{ ...styles.subValue, color: foregroundColor }} numberOfLines={1}>
          {formatCurrency(Number(token?.amount || 0) * vm.price)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...styles.subValue, marginEnd: 8, color: foregroundColor }}>
            {`${numeral(token?.amount ?? 0).format('0,0.000000')} ${token?.symbol}`}
          </Text>
          <Coin
            chainId={network.chainId}
            address={token?.address || ''}
            symbol={token?.symbol}
            iconUrl={token?.iconUrl}
            size={19}
          />
        </View>
      </View>

      <Button
        themeColor={themeColor}
        title={t('button-send')}
        style={{ borderRadius: 50, marginVertical: 16 }}
        icon={() => <FontAwesome name="send-o" color="white" size={14} />}
        onPress={() => onSendPress?.(token)}
      />

      <Text style={{ fontSize: 21, marginTop: 12, color: '#75869c', fontWeight: '600', opacity: 0.72 }}>
        {t('modal-token-details-about', { token: token?.symbol })}
      </Text>

      <View style={{ marginVertical: 8 }}>
        {vm.loading ? (
          <Skeleton style={{ flex: 1, width: '100%', height: 32 }} />
        ) : (
          <Text style={{ lineHeight: 22, color: '#75869c', fontSize: 15 }}>{vm.firstDescription}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  subTitle: {
    color: thirdFontColor,
    opacity: 0.72,
    fontWeight: '500',
    fontSize: 15,
  },

  subValue: {
    fontSize: 17,
    fontWeight: '500',
  },
});
