import { Coin, Skeleton } from '../../components';
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

      <View style={{ marginTop: 16 }}>
        {vm.loading ? (
          <Skeleton style={{ flex: 1, width: '100%' }} />
        ) : (
          <Text style={{ lineHeight: 22, color: '#75869c', fontSize: 15 }}>{vm.firstDescription}</Text>
        )}
      </View>
    </View>
  );
});
