import Animated, { FadeInRight, FadeOut } from 'react-native-reanimated';
import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Coin } from '../../../components';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

interface Props {
  busy?: boolean;
  showTitle?: boolean;
  title?: string;
  titleTouchable?: boolean;
  onTitlePress?: () => string;
  onTokenPress?: () => void;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  editable?: boolean;
  textValue?: string;
  onTextInputChanged?: (text: string) => void;
}

export default observer((props: Props) => {
  const { borderColor, textColor, secondaryTextColor } = Theme;
  const [textInputValue, setTextInputValue] = useState('');
  const textRef = useRef<TextInput>(null);

  const onTitlePress = () => {
    const amount = props.onTitlePress?.() || '';
    setTextInputValue(amount);
  };

  return (
    <View style={{ borderWidth: 1, borderRadius: 10, borderColor, padding: 8, paddingHorizontal: 16, paddingBottom: 7 }}>
      {props.showTitle ? (
        <TouchableOpacity
          style={{ flexDirection: 'row', paddingBottom: 6 }}
          onPress={onTitlePress}
          disabled={!props.titleTouchable}
        >
          <Text style={{ fontSize: 12, color: secondaryTextColor }}>{props?.title}</Text>
        </TouchableOpacity>
      ) : undefined}

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        <TextInput
          ref={textRef}
          editable={props.editable}
          style={{ flex: 1, fontSize: 22, color: textColor }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={props.textValue ?? textInputValue}
          onChangeText={(t) => {
            setTextInputValue(t);
            props?.onTextInputChanged?.(t);
          }}
        />

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 12 }} onPress={props.onTokenPress}>
          {props.tokenAddress === undefined ? undefined : (
            <Animated.View entering={FadeInRight.springify()} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Coin address={props.tokenAddress} symbol={props.tokenSymbol} chainId={props.chainId} size={25} forceRefresh />
              <Text style={{ fontSize: 20, marginStart: 10, fontWeight: '500', color: textColor }}>{props.tokenSymbol}</Text>
            </Animated.View>
          )}
          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 4 }} color={textColor} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
});
