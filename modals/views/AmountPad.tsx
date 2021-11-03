import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { numericFontFamily, secondaryFontColor, themeColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
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

export default observer((props: SubViewProps) => {
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
    <SafeViewContainer style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} />}

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onTokenPress}>
          <Text style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500' }}>USDC</Text>

          <Coin symbol="USDC" style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 64,
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

      <View style={{ flex: 1 }} />

      <Numpad onPress={onNumPress} />

      <Button title="Next" onPress={props.onNext} />
    </SafeViewContainer>
  );
});
