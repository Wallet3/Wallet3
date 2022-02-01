import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { Button, SafeViewContainer } from '../../components';
import Numpad, { DefaultNumpadHandler } from '../../components/Numpad';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleProp, View, ViewStyle } from 'react-native';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import { BioType } from '../../viewmodels/Authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import styles from '../styles';

interface Props {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onCancel?: () => void;
  disableCancel?: boolean;
  style?: StyleProp<ViewStyle>;
  bioType?: BioType;
  onBioAuth?: () => void;
}

const Passpad = ({ themeColor, onCancel, onCodeEntered, disableCancel, style, bioType, onBioAuth }: Props) => {
  const { t } = i18n;
  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');

  const { tintColor, isLightMode, foregroundColor, mode } = Theme;
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
        {new Array(passcode.length)
          .fill(0)
          .map((_, index) => renderFilledCircle(index, isLightMode ? foregroundColor : tintColor))}

        {new Array(passcodeLength - passcode.length)
          .fill(0)
          .map((_, index) => renderEmptyCircle(index, isLightMode ? foregroundColor : tintColor))}
      </Animatable.View>

      <View style={{ flex: 1 }} />

      <Numpad
        onPress={(value) => DefaultNumpadHandler(value, passcode, setPasscode)}
        disableDot
        bioType={bioType}
        onBioAuth={onBioAuth}
        color={isLightMode ? undefined : tintColor}
        mode={mode}
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
  bioType?: BioType;
}

export const FullPasspad = ({ height, themeColor, onCodeEntered, bioType, onBioAuth }: FullPasspadProps) => {
  const { backgroundColor } = Theme;

  return (
    <SafeAreaProvider style={{ flex: 1, height, backgroundColor }}>
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
