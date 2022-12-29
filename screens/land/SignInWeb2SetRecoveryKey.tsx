import { Button, SafeViewContainer, TextBox } from '../../components';
import { Modalize, useModalize } from 'react-native-modalize';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Confirm } from '../../modals/views/Confirm';
import { LandScreenStack } from '../navigations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MessageKeys from '../../common/MessageKeys';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Portal } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SignInWithApple from '../../viewmodels/auth/SignInWithApple';
import SignInWithGoogle from '../../viewmodels/auth/SignInWithGoogle';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';
import { warningColor } from '../../constants/styles';

export default observer(({ navigation, route }: NativeStackScreenProps<LandScreenStack, 'SetRecoveryKey'>) => {
  const { t } = i18n;
  const [key, setKey] = useState('');
  const { ref: resetRef, open: openReset } = useModalize();

  const platform = route.params as 'apple' | 'google' | undefined;

  useEffect(() => {
    PubSub.subscribe(MessageKeys.CodeScan_64Length, (_, { data }) => {
      setKey(data);
    });

    return () => {
      PubSub.unsubscribe(MessageKeys.CodeScan_64Length);
    };
  }, []);

  return (
    <SafeViewContainer style={{ ...styles.rootContainer }} paddingHeader includeTopPadding>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: -12, marginBottom: -8 }}>
        <MaterialCommunityIcons name="shield-key" size={64} color={'#61D800'} />
      </View>

      <View style={{ marginVertical: 24 }}>
        <Text style={{ marginBottom: 8 }}>{t('land-sign-in-set-recovery-key')}</Text>
        <TextBox
          value={key}
          onChangeText={(t) => setKey(t)}
          secureTextEntry
          onScanRequest={() => PubSub.publish(MessageKeys.openGlobalQRScanner, t('qrscan-tip-4'))}
        />
      </View>

      <View style={{ flex: 1 }} />

      <Button
        title={t('button-reset')}
        style={{ marginBottom: 12 }}
        reverse
        themeColor={warningColor}
        onPress={() => openReset()}
      />

      <Button
        title={t('button-next')}
        disabled={key.length < 64}
        txtStyle={{ textTransform: 'none' }}
        onPress={async () => {
          if (platform === 'apple' ? await SignInWithApple.recover(key) : await SignInWithGoogle.recover(key)) {
            navigation.navigate('SetupPasscode', 'ImportWallet' as any);
          } else {
            showMessage({ type: 'warning', message: t('msg-invalid-recovery-key') });
          }
        }}
      />

      <Portal>
        <Modalize
          ref={resetRef}
          adjustToContentHeight
          disableScrollIfPossible
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          modalStyle={{ padding: 0, margin: 0 }}
        >
          <SafeAreaProvider style={{ height: 270, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
            <Confirm
              confirmButtonTitle={t('settings-reset-modal-button-confirm')}
              desc={t('land-recovery-reset')}
              themeColor="crimson"
              style={{ flex: 1 }}
              onSwipeConfirm={() => {
                platform === 'apple' ? SignInWithApple.reset() : SignInWithGoogle.reset();
                navigation.pop();
              }}
            />
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </SafeViewContainer>
  );
});
