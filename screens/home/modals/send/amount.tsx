import { Image, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, numericFontFamily, secondaryFontColor } from '../../../../constants/styles';

import Button from '../../../../components/button';
import ETH from '../../../../assets/icons/crypto/usdc.svg';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Swiper from 'react-native-swiper';

interface AmountProps {
  onBack?: () => void;
}

const AmountView = (props: AmountProps) => {
  return (
    <View style={{ padding: 16, height: 420 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => props.onBack?.()}>
          <Ionicons name="arrow-back-circle-outline" size={34} color={'#627EEA'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignSelf: 'center',
            borderRadius: 50,
            borderWidth: 1,
            borderColor: secondaryFontColor,
            padding: 4,
            paddingHorizontal: 12,
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <Text style={{ fontSize: 19, marginEnd: 8, color: fontColor }}>USDC</Text>

          <ETH width={21} height={21} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}></View>

      <Button />
    </View>
  );
};

interface Props {
  onBack?: () => void;
  onNext?: () => void;
}

export default (props: Props) => {
  return (
    <Swiper scrollEnabled={false} showsButtons={false} showsPagination={false} style={{}}>
      <AmountView onBack={() => props.onBack?.()} />
    </Swiper>
  );
};
