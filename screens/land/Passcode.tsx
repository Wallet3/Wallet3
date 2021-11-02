import * as Animatable from 'react-native-animatable';

import { Button, Loader, Numpad, NumpadChar, SafeViewContainer } from '../../components';
import { Modal, SafeAreaView, Switch, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import AppVM from '../../viewmodels/App';
import Authentication from '../../viewmodels/Authentication';
import { LandStackNavs } from './navs';
import MnemonicOnce from '../../viewmodels/MnemonicOnce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ navigation }: NativeStackScreenProps<LandStackNavs, 'Backup'>) => {
  const passcodeLength = 6;
  const [passcode, setPasscode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
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

  const finishInitialization = async () => {
    setBusy(true);

    await Authentication.setupPin(passcode);

    if (Authentication.biometricsEnabled) await Authentication.authenticate();

    await MnemonicOnce.save();

    setBusy(false);

    await AppVM.init();
  };

  const renderEmptyCircle = (index: number) => (
    <View key={index} style={{ borderRadius: 10, width: 20, height: 20, borderWidth: 2, marginHorizontal: 6 }} />
  );

  const renderFilledCircle = (index: number) => (
    <View key={index} style={{ borderRadius: 10, backgroundColor: '#000', width: 20, height: 20, marginHorizontal: 6 }} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeViewContainer style={styles.rootContainer}>
        <View style={{ flex: 1 }} />

        <Animatable.Text ref={tipView as any} style={{ textAlign: 'center', marginBottom: 16, color: secondaryFontColor }}>
          {confirm ? 'Please enter again' : ' '}
        </Animatable.Text>

        <Animatable.View ref={passcodeView as any} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {new Array(passcode.length).fill(0).map((_, index) => renderFilledCircle(index))}
          {new Array(passcodeLength - passcode.length).fill(0).map((_, index) => renderEmptyCircle(index))}
        </Animatable.View>

        <View style={{ flex: 1 }} />

        {Authentication.biometricsSupported ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ marginBottom: -2, color: secondaryFontColor }}>Enable Biometrics</Text>

            <Switch
              value={Authentication.biometricsEnabled}
              trackColor={{ true: themeColor }}
              onValueChange={(v) => Authentication.setBiometrics(v)}
            />
          </View>
        ) : undefined}

        <Numpad onPress={onNumpadPress} disableDot />

        <Button title="Done" disabled={!verified || busy} onPress={() => finishInitialization()} />
      </SafeViewContainer>

      <Loader loading={busy} />
    </SafeAreaView>
  );
});
