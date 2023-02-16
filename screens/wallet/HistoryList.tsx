import {
  Approve_ERC20,
  SafeTransferFrom_ERC1155,
  SafeTransferFrom_ERC721,
  SafeTransferFrom_WithData_ERC721,
  Transfer_ERC20,
  Transfer_ERC721,
} from '../../viewmodels/transferring/RequestTypes';
import { Coin, NullableImage } from '../../components';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

import IllustrationNoData from '../../assets/illustrations/misc/nodata.svg';
import Networks from '../../viewmodels/core/Networks';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import Transaction from '../../models/entities/Transaction';
import dayjs from 'dayjs';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import { useState } from 'react';
import { utils } from 'ethers';

interface Props {
  data: Transaction[];
  onTxPress?: (tx: Transaction) => void;
  onEndReached?: () => void;
}

const Methods = new Map([
  [Transfer_ERC20, 'sent'],
  [Transfer_ERC721, 'sent'], // Transfer ERC-721
  [SafeTransferFrom_ERC721, 'sent'],
  [SafeTransferFrom_ERC1155, 'sent'], // Transfer ERC-1155
  [SafeTransferFrom_WithData_ERC721, 'sent'],
  [Approve_ERC20, 'approve'],
  ['0x', 'sent'],
]);

const StatusColor = {
  confirmed: 'yellowgreen',
  failed: 'crimson',
  pending: 'deepskyblue',
};

const Tx = observer(
  ({
    item,
    onPress,
    textColor,
    iconBackgroundColor,
  }: {
    onPress?: (tx: Transaction) => void;
    item: Transaction;
    textColor: string;
    iconBackgroundColor: string;
  }) => {
    const method = Methods.get((item.data as string)?.substring(0, 10)) ?? 'contract-interaction';
    const { t } = i18n;

    const { chainId } = item;
    const [network] = useState(Networks.find(chainId));
    const [tokenSymbol] = useState(item.readableInfo?.symbol?.trim() || network?.symbol);

    const nft = item.readableInfo?.nft;
    const dappIcon = item.readableInfo?.icon;
    const amount = Number(item.readableInfo?.amount) || Number(utils.formatEther(item.value ?? '0'));
    const cancelTx = item.readableInfo?.cancelTx;
    const to: string = item.readableInfo?.recipient ?? item.readableInfo.dapp ?? item.to ?? '';
    const status = item.blockNumber ? (item.status ? 'confirmed' : 'failed') : 'pending';
    const methodName = t(`home-history-item-type-${method ?? (item.data !== '0x' ? 'contract-interaction' : 'sent')}`);

    return (
      <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 8 }} onPress={() => onPress?.(item as Transaction)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '64%' }}>
            {tokenSymbol === network?.symbol ? (
              generateNetworkIcon({ ...network!, width: 15, style: { marginEnd: 6.5, marginStart: 0.5, marginTop: -1 } })
            ) : (
              <Coin symbol={tokenSymbol} size={16} style={{ marginEnd: 6 }} chainId={chainId} address={item.to} />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 16, marginEnd: 4, maxWidth: 180, color: textColor }} numberOfLines={1}>
                {`${cancelTx ? `${t('tip-cancel-action')} ` : ''}${methodName}`}
              </Text>
              {method === 'contract-interaction' ? undefined : (
                <Text style={{ fontSize: 16, color: textColor, maxWidth: '80%' }} numberOfLines={1}>
                  {`${amount > 0 ? amount : ''} ${nft || tokenSymbol}`.trim()}
                </Text>
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
              <NullableImage
                uri={dappIcon}
                size={16}
                imageRadius={3}
                imageBackgroundColor={iconBackgroundColor}
                text={to}
                containerStyle={{ marginEnd: 6 }}
              />
            ) : (
              <Text style={{ fontWeight: '300', marginEnd: 3, color: textColor }}>{t('home-history-item-to')}:</Text>
            )}
            <Text style={{ fontWeight: '300', maxWidth: 210, color: textColor }} numberOfLines={1}>
              {to.startsWith('0x') || to.includes(':') ? formatAddress(to!, 10, 5) : to}
            </Text>
          </View>
          <Text style={{ fontWeight: '300', color: textColor }}>{dayjs(item.timestamp ?? 0).format('YYYY-MM-DD')}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export default observer(({ data, onTxPress, onEndReached }: Props) => {
  const { t } = i18n;
  const { textColor, backgroundColor } = Theme;

  const renderItem = ({ item, index }: ListRenderItemInfo<Transaction>) => (
    <Tx textColor={textColor} item={item} onPress={onTxPress} iconBackgroundColor={backgroundColor} />
  );

  if (data.length === 0) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <IllustrationNoData width={150} height={150} />
        <Text style={{ color: secondaryFontColor, marginTop: 24, fontWeight: '500', textTransform: 'capitalize' }}>
          {t('home-history-notxs')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => `${i.hash} ${i.blockNumber} ${i.timestamp}`}
      renderItem={renderItem}
      style={{ paddingHorizontal: 16 }}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
    />
  );
});
