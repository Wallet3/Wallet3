import { Button, Coin, Numpad } from '../../components';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderColor, fontColor, numericFontFamily, secondaryFontColor, themeColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import Swiper from 'react-native-swiper';
import Tokenlist from './tokenlist';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  disableBack?: boolean;
  disableBalance?: boolean;
}

export const NumpadView = observer((props: SubViewProps) => {
  const [amount, setAmount] = useState('0');

  const onNumPress = (num: string) => {
    if (num === '.') {
      if (amount.includes('.')) return;
      setAmount((pre) => pre + '.');
      return;
    }

    if (num === 'del') {
      setAmount((pre) => pre.slice(0, -1) || '0');
      return;
    }

    if (num === 'clear') {
      setAmount('0');
      return;
    }

    setAmount((pre) => {
      const combined = `${pre}${num}`;

      return combined.startsWith('0') && !combined.startsWith('0.') ? Number(combined).toString() : combined;
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} />}

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onTokenPress}>
          <Text style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500' }}>USDC</Text>

          <Coin symbol="USDC" style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 48,
          fontFamily: numericFontFamily,
          fontWeight: '600',
          marginVertical: 4,
          textAlign: 'center',
          color: themeColor,
        }}
        numberOfLines={1}
      >
        {amount}
      </Text>

      <Numpad onPress={onNumPress} />

      <Button title="Next" onPress={props.onNext} />
    </View>
  );
});

interface Props {
  onNext?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <NumpadView onNext={props.onNext} disableBack onTokenPress={() => swiper.current?.scrollTo(1)} />
      <Tokenlist onBack={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});
