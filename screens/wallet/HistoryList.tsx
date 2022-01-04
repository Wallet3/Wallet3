import { ChainIdsSymbol, Networks } from '../../common/Networks';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Transaction, { ITransaction } from '../../models/Transaction';

import { Coin } from '../../components';
import Image from 'react-native-expo-cached-image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import dayjs from 'dayjs';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import { utils } from 'ethers';

interface Props {
  data: Transaction[];
  onTxPress?: (tx: Transaction) => void;
}

const Methods = new Map([
  ['0xa9059cbb', 'sent'],
  ['0x095ea7b3', 'approve'],
]);

const StatusColor = {
  confirmed: 'yellowgreen',
  failed: 'crimson',
  pending: 'deepskyblue',
};

const Tx = observer(({ item, onPress }: { onPress?: (tx: Transaction) => void; item: Transaction }) => {
  const method = (item.data as string).substring(0, 10);
  const { t } = i18n;

  const { chainId } = item;
  const tokenSymbol = item.readableInfo?.symbol ?? ChainIdsSymbol.get(chainId);
  const dappIcon = item.readableInfo?.icon;
  const amount = item.readableInfo?.amount ?? utils.formatEther(item.value ?? '0');

  const to: string = item.readableInfo?.recipient ?? item.readableInfo.dapp ?? item.to;
  const status = item.blockNumber ? (item.status ? 'confirmed' : 'failed') : 'pending';
  const methodName = t(
    `home-history-item-type-${Methods.get(method) ?? (item.data !== '0x' ? 'contract-interaction' : 'sent')}`
  );

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
            <Text style={{ fontSize: 16, marginEnd: 4, maxWidth: 120 }} numberOfLines={1}>{`${methodName}`}</Text>
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
          <Text style={{ color: 'white', fontWeight: '300', fontSize: 12 }}>{t(`modal-tx-details-status-${status}`)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {dappIcon ? (
            generateNetworkIcon({
              color: Networks.find((n) => n.chainId === chainId)?.color,
              chainId,
              width: 12,
              style: { marginEnd: 6, marginStart: 2 },
            })
          ) : (
            <Text style={{ fontWeight: '300', marginEnd: 2 }}>{t('home-history-item-to')}:</Text>
          )}
          <Text style={{ fontWeight: '300', maxWidth: 250 }} numberOfLines={1}>
            {to.length === 42 ? formatAddress(to!, 10, 5) : to}
          </Text>
        </View>
        <Text style={{ fontWeight: '300' }}>{dayjs(item.timestamp ?? 0).format('YYYY-MM-DD')}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default observer(({ data, onTxPress }: Props) => {
  const { t } = i18n;
  const renderItem = ({ item, index }: ListRenderItemInfo<Transaction>) => <Tx item={item} onPress={onTxPress} />;

  if (data.length === 0) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Ionicons name="server-outline" size={32} color={secondaryFontColor} />
        <Text style={{ color: secondaryFontColor, marginVertical: 12 }}>{t('home-history-notxs')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => `${i.hash} ${i.blockNumber} ${i.timestamp}`}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
    />
  );
});
