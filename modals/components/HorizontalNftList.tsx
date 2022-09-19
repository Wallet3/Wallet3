import { StyleProp, Text, View, ViewStyle } from 'react-native';

import MultiSourceImage from '../../components/MultiSourceImage';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

interface Props {
  nfts: { amount: number; content: string; content_type: string }[];
  style?: StyleProp<ViewStyle>;
  inOut: 'in' | 'out';
}

export default observer(({ nfts, style, inOut }: Props) => {
  const { backgroundColor, tintColor, thirdTextColor } = Theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...(style || ({} as any)) }}>
      {nfts.length <= 2 ? (
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
          {`${inOut === 'in' ? '-' : '+'} ${nfts[0].amount}`}
        </Text>
      ) : undefined}

      {nfts.map((t, i) => (
        <View key={`${i}_${t.content}_${t.amount}`}>
          <MultiSourceImage sourceTypes={[]} uriSources={[t.content]} style={{ width: 27, height: 27 }} />
        </View>
      ))}
    </View>
  );
});
