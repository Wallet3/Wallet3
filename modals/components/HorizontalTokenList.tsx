import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { Coin } from '../../components';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

interface Props {
  tokens: { chainId: number; address: string; symbol: string; amount: number }[];
  style?: StyleProp<ViewStyle>;
  inOut: 'in' | 'out';
}

export default observer(({ tokens, style, inOut }: Props) => {
  const { backgroundColor, tintColor, thirdTextColor } = Theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...(style || ({} as any)) }}>
      {tokens.length <= 2 ? (
        <Text
          numberOfLines={1}
          style={{
            marginEnd: 5,
            fontSize: 17,
            fontWeight: '600',
            color: inOut === 'in' ? thirdTextColor : tintColor,
            maxWidth: 81,
          }}
        >
          {`${inOut === 'in' ? '-' : '+'} ${formatCurrency(tokens[0].amount, '')}`}
        </Text>
      ) : undefined}

      {tokens.slice(0, 5).map((t, index) => (
        <View
          key={t.address || t.symbol}
          style={{
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: -index,
            marginStart: index === 0 ? 0 : -12,
            borderWidth: 2,
            borderColor: backgroundColor,
            borderRadius: 15,
            overflow: 'hidden',
          }}
        >
          <Coin {...t} size={27} />
        </View>
      ))}
    </View>
  );
});
