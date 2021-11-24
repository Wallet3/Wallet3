import * as Animatable from 'react-native-animatable';

import { Button, Numpad, NumpadChar } from '../../components';
import React, { useEffect, useRef, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

interface Props {
  biometricsSupported?: boolean;
  biometricsEnabled?: boolean;
  themeColor?: string;
  onBiometricValueChange?: (value: boolean) => void;
  onDone?: (passcode: string) => void;
}

export default observer(({ biometricsSupported, biometricsEnabled, themeColor, onBiometricValueChange, onDone }: Props) => {
  const { t } = i18n;

  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [verified, setVerified] = useState(false);

  const passcodeView = useRef<Animatable.View>(null);
  const tipView = useRef<Animatable.Text>(null);

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
      setVerified(false);
      return;
    }

    if (confirm) {
      if (passcode === confirm) {
        setVerified(true);
      } else {
        passcodeView.current?.shake?.();
        setTimeout(() => setPasscode(''), 500);
      }
      return;
    }

    setConfirm(passcode);
    setPasscode('');
    tipView.current?.fadeIn?.();
  }, [passcode]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} />

      <Animatable.Text ref={tipView as any} style={{ textAlign: 'center', marginBottom: 16, color: secondaryFontColor }}>
        {confirm ? t('land-passcode-EnterAgain') : ' '}
      </Animatable.Text>

      <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {new Array(passcode.length).fill(0).map((_, index) => renderFilledCircle(index))}
        {new Array(passcodeLength - passcode.length).fill(0).map((_, index) => renderEmptyCircle(index))}
      </Animatable.View>

      <View style={{ flex: 1 }} />

      {biometricsSupported ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ marginBottom: -2, color: secondaryFontColor }}>{t('land-passcode-EnableBiometric')}</Text>

          <Switch value={biometricsEnabled} trackColor={{ true: themeColor }} onValueChange={onBiometricValueChange} />
        </View>
      ) : undefined}

      <Numpad onPress={onNumpadPress} disableDot />

      <Button
        title={t('button-done')}
        disabled={!verified}
        onPress={() => onDone?.(passcode)}
        style={{ marginTop: 12 }}
        themeColor={themeColor}
      />
    </View>
  );
});
