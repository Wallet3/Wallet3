import React from 'react';
import Swiper from 'react-native-swiper';
import { View } from 'react-native';

const AmountView = () => {
  return <View style={{ backgroundColor: 'blue' }}></View>;
};

export default () => {
  return (
    <Swiper scrollEnabled={false} showsButtons={false} showsPagination={false}>
      <AmountView />
    </Swiper>
  );
};
