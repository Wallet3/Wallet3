import React, { useState } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import LINQ from 'linq';
import MultiSourceImage from '../../components/MultiSourceImage';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

interface Props {
  nfts: { amount: number; content: string; content_type: string }[];
  style?: StyleProp<ViewStyle>;
  inOut: 'in' | 'out';
}

export default observer(({ nfts, style, inOut }: Props) => {
  const { backgroundColor, tintColor, thirdTextColor } = Theme;
  const [amount] = useState(LINQ.from(nfts).sum((t) => t.amount));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...(style || ({} as any)) }}>
      {nfts.length < 2 ? (
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
          {`${inOut === 'in' ? '-' : '+'} ${amount}`}
        </Text>
      ) : undefined}

      {nfts.slice(0, 5).map((t, i) => (
        <View
          key={`${i}_${t.content}_${t.amount}`}
          style={{
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: -i,
            marginStart: i === 0 ? 0 : -12,
            borderWidth: 2,
            borderColor: backgroundColor,
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <MultiSourceImage
            sourceTypes={[]}
            uriSources={[t.content]}
            style={{ width: 27, height: 27, borderRadius: 5 }}
            loadingIconSize={10}
          />
        </View>
      ))}
    </View>
  );
});
