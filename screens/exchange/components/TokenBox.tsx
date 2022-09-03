import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Coin } from '../../../components';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

interface Props {
  busy?: boolean;
  showTitle?: boolean;
  title?: string;
  titleTouchable?: boolean;
  onTitlePress?: () => void;
  onTokenPress?: () => void;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  onTextInputChanged?: (text: string) => void;
}

export default observer((props: Props) => {
  const { borderColor, textColor, secondaryTextColor } = Theme;

  return (
    <View style={{ borderWidth: 1, borderRadius: 10, borderColor, padding: 8, paddingHorizontal: 16, paddingBottom: 6 }}>
      {props.showTitle ? (
        <TouchableOpacity
          style={{ flexDirection: 'row', paddingBottom: 6 }}
          onPress={props.onTitlePress}
          disabled={!props.titleTouchable}
        >
          <Text style={{ fontSize: 12, color: secondaryTextColor }}>{props?.title}</Text>
        </TouchableOpacity>
      ) : undefined}

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        <TextInput style={{ flex: 1, fontSize: 22 }} keyboardType="decimal-pad" placeholder="0.00" />

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 12 }} onPress={props.onTokenPress}>
          {props.tokenAddress === undefined ? undefined : (
            <Coin address={props.tokenAddress} symbol={props.tokenSymbol} chainId={props.chainId} size={25} forceRefresh />
          )}
          <Text style={{ fontSize: 20, marginStart: 10, fontWeight: '500', color: textColor }}>{props.tokenSymbol}</Text>
          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 4 }} color={textColor} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
});
