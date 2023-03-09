import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button, Placeholder, SafeViewContainer } from '../../components';
import Numpad, { DefaultNumpadHandler } from '../../components/Numpad';
import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { renderEmptyCircle, renderFilledCircle } from '../../components/PasscodeCircle';

import { BioType } from '../../viewmodels/auth/Authentication';
import { FadeInDownView } from '../../components/animations';
import IllustrationLock from '../../assets/illustrations/misc/lock.svg';
import { MaterialIcons } from '@expo/vector-icons';
import { ReactiveScreen } from '../../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import numeral from 'numeral';
import { observer } from 'mobx-react-lite';
import { parseMilliseconds } from '../../utils/time';
import styles from '../styles';
import { warningColor } from '../../constants/styles';

interface Props {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onCancel?: () => void;
  disableCancelButton?: boolean;
  style?: StyleProp<ViewStyle>;
  numPadStyle?: StyleProp<ViewStyle>;
  bioType?: BioType;
  onBioAuth?: () => void;
  failedAttempts?: number;
  passLength?: number;
}

const Passpad = ({
  themeColor,
  onCancel,
  onCodeEntered,
  disableCancelButton,
  style,
  bioType,
  onBioAuth,
  failedAttempts,
  passLength,
  numPadStyle,
}: Props) => {
  const { t } = i18n;
  const passcodeLength = passLength || 6;
  const [passcode, setPasscode] = useState('');

  const { isLightMode, foregroundColor, mode } = Theme;
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
    <View style={{ flex: 1, ...(style as any) }}>
      <Placeholder />

      <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {new Array(passcode.length)
          .fill(0)
          .map((_, index) => renderFilledCircle(index, isLightMode ? foregroundColor : themeColor))}

        {new Array(Math.max(0, passcodeLength - passcode.length))
          .fill(0)
          .map((_, index) => renderEmptyCircle(index, isLightMode ? foregroundColor : themeColor))}
      </Animatable.View>

      {(failedAttempts || 0) >= 2 ? (
        <Animated.View
          entering={FadeIn.delay(0)}
          style={{
            marginTop: 16,
            padding: 4,
            paddingHorizontal: 12,
            borderRadius: 100,
            backgroundColor: warningColor,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>{t('lock-screen-failed-attempts', { attempts: failedAttempts })}</Text>
        </Animated.View>
      ) : undefined}

      <Placeholder />

      <Numpad
        onPress={(value) => DefaultNumpadHandler({ value, state: passcode, setStateAction: setPasscode, passLength })}
        disableDot
        bioType={bioType}
        onBioAuth={onBioAuth}
        color={isLightMode ? undefined : themeColor}
        mode={mode}
        style={numPadStyle}
      />

      {disableCancelButton ? undefined : (
        <Button title={t('button-cancel')} onPress={() => onCancel?.()} themeColor={themeColor} style={{ marginTop: 12 }} />
      )}
    </View>
  );
};

export default Passpad;

interface FullPasspadProps {
  themeColor?: string;
  onCodeEntered: (code: string) => Promise<boolean>;
  onBioAuth?: () => void;
  height?: number;
  borderRadius?: number;
  bioType?: BioType;
  appAvailable: boolean;
  unlockTimestamp?: number;
  failedAttempts?: number;
}

export const FullPasspad = observer((props: FullPasspadProps) => {
  const {
    themeColor,
    height,
    onCodeEntered,
    bioType,
    onBioAuth,
    borderRadius,
    appAvailable,
    unlockTimestamp,
    failedAttempts,
  } = props;

  const { t } = i18n;
  const { textColor } = Theme;
  const { height: fullScreenHeight, width } = ReactiveScreen;
  const { days, hours, minutes, seconds } = parseMilliseconds(Math.max(0, (unlockTimestamp || 0) - Date.now()));

  const [_, forceUpdate] = useState<any>();

  useEffect(() => {
    let timer: NodeJS.Timer;

    const refresh = () => {
      forceUpdate(Date.now());
      timer = setTimeout(() => refresh(), 10 * 1000);
    };

    refresh();

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <SafeViewContainer
      style={{
        flex: 1,
        height: height || fullScreenHeight,
        width,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
      }}
    >
      {appAvailable || (days === 0 && hours === 0 && minutes === 0 && seconds === 0) ? (
        <Passpad
          themeColor={themeColor}
          disableCancelButton
          onCodeEntered={onCodeEntered}
          style={{ height: height || fullScreenHeight, paddingBottom: 8 }}
          onBioAuth={onBioAuth}
          bioType={bioType}
          failedAttempts={failedAttempts}
        />
      ) : (
        <FadeInDownView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <IllustrationLock width={150} height={150} />
          <Text style={{ fontSize: 19, fontWeight: '600', marginTop: 24, color: warningColor, textTransform: 'uppercase' }}>
            {t('lock-screen-wallet-is-locked')}
          </Text>
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: '600',
              marginTop: 8,
              color: textColor,
              opacity: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {t('lock-screen-remaining-time', {
              time: `${numeral(hours).format('00,')}:${numeral(minutes || 1).format('00,')}`,
            })}
          </Text>
        </FadeInDownView>
      )}
    </SafeViewContainer>
  );
});
