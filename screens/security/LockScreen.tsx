import * as Animatable from 'react-native-animatable';

import { Numpad, NumpadChar, SafeViewContainer } from '../../components';
import React, { useEffect, useRef, useState } from 'react';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import Authentication from '../../viewmodels/Authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const passcodeView = useRef<Animatable.View>(null);
  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');

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

    Authentication.authorize(passcode).then((success) => {
      if (success) return;

      passcodeView.current?.shake?.();
      setTimeout(() => setPasscode(''), 500);
    });
  }, [passcode]);

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <SafeViewContainer style={{ paddingHorizontal: 16, flex: 1 }}>
        <View style={{ flex: 1 }} />

        <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {new Array(passcode.length).fill(0).map((_, index) => renderFilledCircle(index))}
          {new Array(passcodeLength - passcode.length).fill(0).map((_, index) => renderEmptyCircle(index))}
        </Animatable.View>

        <View style={{ flex: 1 }} />

        {Authentication.biometricsSupported ? undefined : undefined}

        <Numpad onPress={onNumpadPress} disableDot />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
