import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Transaction, { ITransaction } from '../../models/Transaction';

import { ChainIdsSymbol } from '../../common/Networks';
import { Coin } from '../../components';
import Image from 'react-native-expo-cached-image';
import React from 'react';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  data: Transaction[];
  onTxPress?: (tx: Transaction) => void;
}

const Methods = new Map([
  ['0xa9059cbb', 'Sent'],
  ['0x095ea7b3', 'Approve'],
]);

const StatusColor = {
  Confirmed: 'yellowgreen',
  Failed: 'crimson',
  Pending: 'deepskyblue',
};

const Tx = observer(({ item, onPress }: { onPress?: (tx: Transaction) => void; item: Transaction }) => {
  const method = (item.data as string).substring(0, 10);

  const { chainId } = item;
  const tokenSymbol = item.readableInfo?.symbol ?? ChainIdsSymbol.get(chainId);
  const dappIcon = item.readableInfo?.icon;
  const amount = item.readableInfo?.amount ?? utils.formatEther(item.value ?? '0');
  const methodName = Methods.get(method) ?? (item.data !== '0x' ? 'Contract Interaction' : `Sent`);
  const to: string = item.readableInfo?.recipient ?? item.readableInfo.dapp ?? item.to;
  const status = item.blockNumber ? (item.status ? 'Confirmed' : 'Failed') : 'Pending';

  return (
    <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 8 }} onPress={() => onPress?.(item as Transaction)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {dappIcon ? (
            <Image source={{ uri: dappIcon }} style={{ width: 16, height: 16, marginEnd: 4 }} />
          ) : (
            <Coin symbol={tokenSymbol} size={16} style={{ marginEnd: 4 }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginEnd: 4 }} numberOfLines={1}>{`${methodName}`}</Text>
            {methodName === 'Contract Interaction' ? undefined : (
              <Text style={{ fontSize: 16 }}>{`${amount} ${tokenSymbol}`}</Text>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: StatusColor[status],
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '300', fontSize: 12 }}>{status}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {dappIcon ? (
            generateNetworkIcon({ chainId, width: 12, style: { marginEnd: 6, marginStart: 2 } })
          ) : (
            <Text style={{ fontWeight: '300', marginEnd: 2 }}>To:</Text>
          )}
          <Text style={{ fontWeight: '300', maxWidth: 250 }} numberOfLines={1}>
            {to.length === 42 ? formatAddress(to!, 10, 5) : to}
          </Text>
        </View>
        <Text style={{ fontWeight: '300' }}>
          {new Date(item.timestamp ?? 0).toLocaleString(undefined, { dateStyle: 'short' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default observer(({ data, onTxPress }: Props) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<Transaction>) => <Tx item={item} onPress={onTxPress} />;

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => `${i.hash} ${i.blockNumber} ${i.timestamp}`}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
    />
  );
});
