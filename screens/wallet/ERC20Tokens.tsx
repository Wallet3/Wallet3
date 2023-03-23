import { Coin, Skeleton } from '../../components';
import { FlatList, ListRenderItemInfo, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import { INetwork } from '../../common/Networks';
import { ITokenMetadata } from '../../common/tokens';
import Theme from '../../viewmodels/settings/Theme';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

const Token = observer(({ item, onPress, chainId }: { item: ITokenMetadata; onPress?: (token: ITokenMetadata) => void; chainId: number }) => {
  const { textColor } = Theme;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: -16,
        paddingVertical: 16,
        paddingBottom: 13,
        paddingHorizontal: 22,
      }}
    >
      <Coin
        chainId={chainId}
        address={item.address}
        symbol={item.symbol}
        style={{ width: 36, height: 36, marginEnd: 16 }}
        iconUrl={item.logoURI}
      />
      <Text style={{ fontSize: 18, color: textColor }} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View style={{ flex: 1 }} />

      {item.loading ? (
        <Skeleton />
      ) : (
        <Text style={{ fontSize: 19, color: textColor }} numberOfLines={1}>
          {formatCurrency(item.amount || '0', '')}
        </Text>
      )}
    </TouchableOpacity>
  );
});

export default observer(
  ({
    tokens,
    loading,
    separatorColor,
    onRefreshRequest,
    onTokenPress,
    network,
  }: {
    tokens?: ITokenMetadata[];
    loading?: boolean;
    separatorColor?: string;
    onRefreshRequest?: () => Promise<any>;
    onTokenPress?: (token: ITokenMetadata) => void;
    network: INetwork;
  }) => {
    const renderItem = ({ item }: ListRenderItemInfo<ITokenMetadata>) => (
      <Token chainId={network.chainId} item={item} onPress={onTokenPress} />
    );
    const [manuallyLoading, setManuallyLoading] = useState(false);

    return (tokens?.length ?? 0) > 0 && !loading ? (
      <FlatList
        data={tokens}
        keyExtractor={(i) => i.address}
        renderItem={renderItem}
        style={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 5 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: separatorColor, marginStart: 56 }} />}
        refreshControl={
          <RefreshControl
            refreshing={manuallyLoading}
            onRefresh={async () => {
              setManuallyLoading(true);
              await onRefreshRequest?.();
              setManuallyLoading(false);
            }}
          />
        }
      />
    ) : (
      <View style={{ flex: 1, padding: 16, paddingVertical: 12 }}>
        <Skeleton style={{ height: 52, width: '100%' }} />
      </View>
    );
  }
);
