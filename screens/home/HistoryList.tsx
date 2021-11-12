import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';

import { ChainIdsSymbol } from '../../common/Networks';
import { Coin } from '../../components';
import { ITransaction } from '../../models/Transaction';
import React from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  pendingData?: any[];
  data: ITransaction[];
}

const Methods = new Map([
  ['0xa9059cbb', 'Transfer Token'],
  ['0x095ea7b3', 'Approve'],
]);

const Tx = observer(({ item }: { item: ITransaction }) => {
  const method = (item.data as string).substring(0, 10);

  const tokenSymbol = item.readableInfo?.symbol;
  const methodName = Methods.get(method) ?? (item.data !== '0x' ? 'Contract Interaction' : `Sent ${tokenSymbol}`);

  return (
    <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
      <Coin symbol={tokenSymbol} size={32} />

      <View>
        <View>
          <Text>{methodName}</Text>
        </View>
      </View>
    </View>
  );
});

export default observer(({ data }: Props) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<ITransaction>) => <Tx item={item} />;

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.hash || `${i.timestamp!}`}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
    />
  );
});
