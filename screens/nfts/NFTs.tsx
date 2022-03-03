import { FlatList, Image, ListRenderItemInfo, Text, View } from 'react-native';
import React, { useState } from 'react';

import App from '../../viewmodels/App';
import { FlatGrid } from 'react-native-super-grid';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const calcIconSize = () => {
  const { width } = ReactiveScreen;

  const NumOfColumns = Math.ceil(width / 100);
  const Size = (width - 8 * NumOfColumns - 10 * NumOfColumns) / NumOfColumns;

  console.log(NumOfColumns, Size);

  return { NumOfColumns, Size };
};

export default observer(() => {
  const [size, setSize] = useState(calcIconSize().Size);
  const { currentAccount } = App;
  const { top } = useSafeAreaInsets();
  const { backgroundColor } = Theme;

  if (!currentAccount) return null;

  const renderItem = ({ item }: ListRenderItemInfo<Nft>) => {
    return (
      <View key={item.id} style={{ marginBottom: 16 }}>
        <Image source={{ uri: item.meta?.image?.url?.PREVIEW }} style={{ width: '100%', height: 270, borderRadius: 10 }} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View />
      <FlatList
        data={currentAccount.nfts.nfts}
        renderItem={renderItem}
        contentContainerStyle={{ marginHorizontal: 16, paddingTop: top }}
      />
    </View>
  );
});
