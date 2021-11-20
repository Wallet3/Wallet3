import { Coin, Skeleton } from '../../components';
import { FlatList, ListRenderItemInfo, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import { IToken } from '../../common/Tokens';
import { fontColor } from '../../constants/styles';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

const Token = observer(({ item, onPress }: { item: IToken; onPress?: (token: IToken) => void }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: -16,
        paddingVertical: 16,
        paddingBottom: 13,
        paddingHorizontal: 22,
      }}
      onPress={() => onPress?.(item)}
    >
      <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} iconUrl={item.iconUrl} />
      <Text style={{ fontSize: 18, color: fontColor }} numberOfLines={1}>
        {item.symbol}
      </Text>
      <View style={{ flex: 1 }} />

      {item.loading ? (
        <Skeleton />
      ) : (
        <Text style={{ fontSize: 19, color: fontColor }} numberOfLines={1}>
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
    onRefreshRequest,
    onTokenPress,
  }: {
    tokens?: IToken[];
    loading?: boolean;
    onRefreshRequest?: () => Promise<any>;
    onTokenPress?: (token: IToken) => void;
  }) => {
    const renderItem = ({ item, index }: ListRenderItemInfo<IToken>) => <Token item={item} onPress={onTokenPress} />;
    const [manuallyLoading, setManuallyLoading] = useState(false);

    return (tokens?.length ?? 0) > 0 && !loading ? (
      <FlatList
        data={tokens}
        keyExtractor={(i) => i.address}
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
        renderItem={renderItem}
        style={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#efefef80', marginStart: 56 }} />}
      />
    ) : (
      <View style={{ flex: 1, padding: 16, paddingVertical: 12 }}>
        <Skeleton style={{ height: 52, width: '100%' }} />
      </View>
    );
  }
);