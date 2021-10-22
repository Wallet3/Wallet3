import { TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../../../constants/styles';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Swiper from 'react-native-swiper';

interface AmountProps {
  onBack?: () => void;
}

const AmountView = (props: AmountProps) => {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => props.onBack?.()}>
          <Ionicons name="arrow-back-circle-outline" size={33} color={fontColor} />
        </TouchableOpacity>
      </View>
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
