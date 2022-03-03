import { FlatList, Image, ListRenderItemInfo, Text, View } from 'react-native';
import React, { useState } from 'react';

import { FlatGrid } from 'react-native-super-grid';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import { observer } from 'mobx-react-lite';

const calcIconSize = () => {
  const { width } = ReactiveScreen;

  const NumOfColumns = Math.ceil(width / 100);
  const Size = (width - 8 * NumOfColumns - 10 * NumOfColumns) / NumOfColumns;

  console.log(NumOfColumns, Size);

  return { NumOfColumns, Size };
};

export default observer(({ data }: { data?: Nft[] }) => {
  const [size, setSize] = useState(calcIconSize().Size);

  const renderItem = ({ item }: ListRenderItemInfo<Nft>) => {
    return (
      <View key={item.id} style={{ marginBottom: 0 }}>
        <Image source={{ uri: item.meta?.image?.url?.PREVIEW }} style={{ width: size, height: size, borderRadius: 10 }} />
      </View>
    );
  };

  return data && data.length > 0 ? (
    <FlatGrid spacing={10} data={data} renderItem={renderItem} style={{ paddingHorizontal: 2 }} itemDimension={size} />
  ) : (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text>No NFTs</Text>
    </View>
  );
});
