import * as shape from 'd3-shape';

import { Coin, Skeleton } from '../../components';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { Grid, LineChart } from 'react-native-svg-charts';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import Coingecko from '../../common/apis/Coingecko';
import { IToken } from '../../common/Tokens';
import { TokenData } from '../../viewmodels/TokenData';
import icons from '../../assets/icons/crypto';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

interface Props {
  token?: IToken;
}

export default observer(({ token }: Props) => {
  const [themeColor, setThemeColor] = useState('#000');
  const [vm, setVM] = useState<TokenData>(new TokenData());

  useEffect(() => {
    if (token) setTimeout(() => vm.setToken(token.symbol, token.address), 0);
  }, [token]);

  const data = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, 80];

  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id={'gradient'} x1={'0'} y1={'0%'} x2={'100%'} y2={'0%'}>
        <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
        <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
      </LinearGradient>
    </Defs>
  );

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Coin symbol={token?.symbol || ''} size={39} />

        <View style={{ marginStart: 16 }}>
          <Text style={{ fontWeight: '500', fontSize: 19, color: themeColor }} numberOfLines={1}>
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
        svg={{
          strokeWidth: 3,
          stroke: 'url(#gradient)',
        }}
      >
        <Gradient />
      </LineChart>

      <View style={{}}>
        {vm.loading ? (
          <Skeleton style={{ flex: 1, width: '100%' }} />
        ) : (
          <Text style={{ lineHeight: 22, color: '#75869c', fontSize: 15 }}>{vm.firstDescription}</Text>
        )}
      </View>
    </View>
  );
});
