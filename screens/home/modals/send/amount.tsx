import { Image, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, numericFontFamily, secondaryFontColor } from '../../../../constants/styles';

import Button from '../../../../components/button';
import ETH from '../../../../assets/icons/crypto/usdc.svg';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Swiper from 'react-native-swiper';
import { TextInput } from 'react-native-gesture-handler';

interface AmountProps {
  onBack?: () => void;
}

const AmountView = (props: AmountProps) => {
  return (
    <View style={{ padding: 16, height: 420 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: -16,
          padding: 16,
          zIndex: 5,
        }}
      >
        <TouchableOpacity onPress={() => props.onBack?.()} style={{}}>
          <Ionicons name="ios-arrow-back-circle-outline" size={34} color={'#627EEA'} style={{ opacity: 0.7 }} />
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
          <Text style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500' }}>USDC</Text>

          <ETH width={21} height={21} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -24 }}>
        <TextInput
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={{
            fontSize: 52,
            borderBottomColor: borderColor,
            borderBottomWidth: 1,
            minWidth: 128,
            textAlign: 'center',
            marginTop: 24,
          }}
        />

        <TouchableOpacity style={{}} onPress={(_) => alert('abc')}>
          <Text style={{ color: secondaryFontColor, padding: 8 }}>Max: 12,345.67</Text>
        </TouchableOpacity>
      </View>

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
