import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Coin } from '../../components';
import Coingecko from '../../common/apis/Coingecko';
import { IToken } from '../../common/Tokens';
import icons from '../../assets/icons/crypto';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

interface Props {
  token?: IToken;
}

export default observer(({ token }: Props) => {
  const [themeColor, setThemeColor] = useState('#000');

  //   const fetchCoin = async (symbol: string) => {
  //     const result = await Coingecko.getCoinDetails(symbol);
  //     if (!result) return;
  //     console.log(result.image);
  //     const color = await getColors(result.image.thumb, { cache: true, fallback: '#000' });
  //     setThemeColor(color['primary'] || color['dominant'] || '#000');
  //   };

  //   useEffect(() => {
  //     if (token) setTimeout(() => fetchCoin(token.symbol), 5000);
  //   }, [token]);

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Coin symbol={token?.symbol || ''} size={39} />

        <View style={{ marginStart: 16 }}>
          <Text style={{ fontWeight: '500', fontSize: 19, color: themeColor }}>{token?.symbol}</Text>
          <Text style={{ fontSize: 14, color: secondaryFontColor }}>$ 2.10</Text>
        </View>
      </View>
    </View>
  );
});
