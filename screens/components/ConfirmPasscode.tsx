import * as Animatable from 'react-native-animatable';

import { Button, Numpad, NumpadChar, Toggle } from '../../components';
import React, { useEffect, useRef, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import { NativeStackNavigationProp } from '@react-navigation/native-stack/lib/typescript/src/types';
import Theme from '../../viewmodels/settings/Theme';
import ToggleSwitch from 'toggle-switch-react-native';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';

interface Props {
  biometricSupported?: boolean;
  biometricEnabled?: boolean;
  themeColor?: string;
  onBiometricValueChange?: (value: boolean) => void;
  onDone?: (passcode: string) => void;
  navigation?: NativeStackNavigationProp<any, any, any>;
}

export default observer(
  ({ biometricSupported, biometricEnabled, themeColor, onBiometricValueChange, onDone, navigation }: Props) => {
    const { t } = i18n;
    const { foregroundColor, tintColor, isLightMode, mode, textColor } = Theme;

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

    const reset = () => (
      <TouchableOpacity
        style={{ padding: 12, margin: -12 }}
        onPress={() => {
          setPasscode('');
          setConfirm('');
          setVerified(false);
        }}
      >
        <Text style={{ color: textColor, fontWeight: '500' }}>{t('button-reset')}</Text>
      </TouchableOpacity>
    );

    useEffect(() => {
      if (!navigation) return;

      const headerRight = (passcode || confirm).length > 0 ? reset : undefined;
      navigation.setOptions({ headerRight });
    }, [passcode]);

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} />

        <Animatable.Text ref={tipView as any} style={{ textAlign: 'center', marginBottom: 16, color: secondaryFontColor }}>
          {confirm ? t('land-passcode-enter-again') : ' '}
        </Animatable.Text>

        <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {new Array(passcode.length)
            .fill(0)
            .map((_, index) => renderFilledCircle(index, isLightMode ? foregroundColor : tintColor))}

          {new Array(passcodeLength - passcode.length)
            .fill(0)
            .map((_, index) => renderEmptyCircle(index, isLightMode ? foregroundColor : tintColor))}
        </Animatable.View>

        <View style={{ flex: 1 }} />

        {biometricSupported ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ marginBottom: -2, color: secondaryFontColor }}>{t('land-passcode-enable-biometric')}</Text>

            <Toggle isOn={biometricEnabled ?? false} onColor={themeColor} onToggle={onBiometricValueChange} />
          </View>
        ) : undefined}

        <Numpad onPress={onNumpadPress} disableDot color={isLightMode ? undefined : tintColor} mode={mode} />

        <Button
          title={t('button-done')}
          disabled={!verified}
          onPress={() => onDone?.(passcode)}
          style={{ marginTop: 12 }}
          themeColor={themeColor}
        />
      </View>
    );
  }
);
