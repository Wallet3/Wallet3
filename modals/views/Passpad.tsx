import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { Button, SafeViewContainer } from '../../components';
import Numpad, { DefaultNumpadHandler } from '../../components/Numpad';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleProp, View, ViewStyle } from 'react-native';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../../i18n';
import styles from '../styles';

interface Props {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onCancel?: () => void;
  disableCancel?: boolean;
  style?: StyleProp<ViewStyle>;
  bioType?: 'fingerprint' | 'faceid';
  onBioAuth?: () => void;
}

const Passpad = ({ themeColor, onCancel, onCodeEntered, disableCancel, style, bioType, onBioAuth }: Props) => {
  const { t } = i18n;
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setPasscode(''), 500);
    });
  }, [passcode]);

  return (
    <SafeViewContainer style={{ ...styles.container, ...((style as any) || {}) }}>
      <View style={{ flex: 1 }} />

      <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {new Array(passcode.length).fill(0).map((_, index) => renderFilledCircle(index))}
        {new Array(passcodeLength - passcode.length).fill(0).map((_, index) => renderEmptyCircle(index))}
      </Animatable.View>

      <View style={{ flex: 1 }} />

      <Numpad
        onPress={(value) => DefaultNumpadHandler(value, passcode, setPasscode)}
        disableDot
        bioType={bioType}
        onBioAuth={onBioAuth}
      />

      {disableCancel ? undefined : (
        <Button title={t('button-cancel')} onPress={() => onCancel?.()} themeColor={themeColor} style={{ marginTop: 12 }} />
      )}
    </SafeViewContainer>
  );
};

export default Passpad;

interface FullPasspadProps {
  height?: number;
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onBioAuth?: () => void;
  bioType?: 'fingerprint' | 'faceid';
}

export const FullPasspad = ({ height, themeColor, onCodeEntered, bioType, onBioAuth }: FullPasspadProps) => {
  return (
    <SafeAreaProvider style={{ flex: 1, height }}>
      <Passpad
        themeColor={themeColor}
        disableCancel
        onCodeEntered={onCodeEntered}
        style={{ marginBottom: 4 }}
        onBioAuth={onBioAuth}
        bioType={bioType}
      />
    </SafeAreaProvider>
  );
};
