import * as Animatable from 'react-native-animatable';

import { Button, SafeViewContainer } from '../../components';
import Numpad, { DefaultNumpadHandler } from '../../components/Numpad';
import React, { useEffect, useRef, useState } from 'react';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import { View } from 'react-native';
import styles from '../styles';

interface Props {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onCancel?: () => void;
  disableCancel?: boolean;
}

export default ({ themeColor, onCancel, onCodeEntered, disableCancel }: Props) => {
  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');

  const passcodeView = useRef<Animatable.View>(null);

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

      <Numpad onPress={(value) => DefaultNumpadHandler(value, passcode, setPasscode)} disableDot />

      {disableCancel ? undefined : <Button title="Cancel" onPress={() => onCancel?.()} themeColor={themeColor} />}
    </SafeViewContainer>
  );
};
