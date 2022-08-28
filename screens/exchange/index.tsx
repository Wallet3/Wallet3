import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Theme from '../../viewmodels/settings/Theme';
import TokenBox from './TokenBox';
import { generateNetworkIcon } from '../../assets/icons/networks/white';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(() => {
  const { backgroundColor, borderColor, shadow, mode, foregroundColor, secondaryTextColor, tintColor } = Theme;
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor, paddingTop: top, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, marginBottom: 10 }}>
        <TouchableOpacity
          style={{
            borderRadius: 6,
            padding: 3,
            paddingHorizontal: 6,
            backgroundColor: tintColor,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({ chainId: 1, hideEVMTitle: true, height: 14, width: 12, color: '#fff' })}
          <Text style={{ color: 'white', fontSize: 12, marginStart: 5 }}>Ethereum</Text>
          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 3 }} color={'#fff'} size={10} />
        </TouchableOpacity>

        <TouchableOpacity></TouchableOpacity>
      </View>
      <TokenBox tokenAddress="" tokenSymbol="ETH" chainId={1} showTitle title="Max: 2.40" titleTouchable />
      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
        <TouchableOpacity style={{ padding: 8, borderRadius: 180, borderWidth: 0, borderColor, backgroundColor }}>
          <Ionicons name="arrow-down-outline" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>
      <TokenBox tokenAddress="" tokenSymbol="USDC" chainId={1} showTitle title="To (estimated)" />
    </View>
  );
});
