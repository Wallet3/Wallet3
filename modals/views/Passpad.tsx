import * as Animatable from 'react-native-animatable';

import { Button, SafeViewContainer } from '../../components';
import Numpad, { NumpadChar } from '../../components/Numpad';
import React, { useEffect, useRef, useState } from 'react';

import { View } from 'react-native';
import styles from '../styles';

const renderEmptyCircle = (index: number) => (
  <View key={index} style={{ borderRadius: 10, width: 20, height: 20, borderWidth: 2, marginHorizontal: 6 }} />
);

const renderFilledCircle = (index: number) => (
  <View key={index} style={{ borderRadius: 10, backgroundColor: '#000', width: 20, height: 20, marginHorizontal: 6 }} />
);

interface Props {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onCancel?: () => void;
}

export default ({ themeColor, onCancel, onCodeEntered }: Props) => {
  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');

  const passcodeView = useRef<Animatable.View>(null);

  const onNumpadPress = (value: NumpadChar) => {
    if (value === 'del') {
      setPasscode(passcode.slice(0, -1));
      return;
    }

    if (value === 'clear') {
      setPasscode('');
      return;
    }

    if (passcode.length >= passcodeLength) return;

    setPasscode((pre) => pre + value);
  };

  useEffect(() => {
    if (passcode.length < passcodeLength) {
      return;
    }

    onCodeEntered(passcode).then((success) => {
      if (success) return;

      passcodeView.current?.shake?.();
      setTimeout(() => setPasscode(''), 500);
    });
  }, [passcode]);

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ flex: 1 }} />

      <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {new Array(passcode.length).fill(0).map((_, index) => renderFilledCircle(index))}
        {new Array(passcodeLength - passcode.length).fill(0).map((_, index) => renderEmptyCircle(index))}
      </Animatable.View>

      <View style={{ flex: 1 }} />

      <Numpad onPress={onNumpadPress} disableDot />

      <Button title="Cancel" onPress={() => onCancel?.()} themeColor={themeColor} />
    </SafeViewContainer>
  );
};
