import * as SecureStore from 'expo-secure-store';

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Authentication from '../../viewmodels/auth/Authentication';
import CopyableText from '../../components/CopyableText';
import Database from '../../models/Database';
import IllustrationBug from '../../assets/illustrations/misc/bug.svg';
import { SafeViewContainer } from '../../components';
import { appEncryptKey } from '../../configs/secret';
import { decrypt } from '../../utils/cipher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { warningColor } from '../../constants/styles';

export default () => {
  const [keys, setKeys] = useState<string[]>([]);
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    Database.keys.find().then(async (keys) => {
      if (!(await Authentication.authenticate({ disableAutoPinRequest: true }))) return;

      const masterKey = `${await SecureStore.getItemAsync('masterKey')}_${appEncryptKey}`;
      if (!masterKey || keys.length === 0) return;

      const plainSecrets = keys
        .map((k) => {
          try {
            return decrypt(k.secret, masterKey!);
          } catch (error) {
            console.log(error);
          }
        })
        .filter((i) => i) as string[];

      setKeys(plainSecrets);
    });
  }, []);

  return (
    <SafeViewContainer style={{ flex: 1, backgroundColor: '#fff', paddingTop: top }}>
      <IllustrationBug width={150} height={150} style={{ alignSelf: 'center', marginBottom: 24 }} />

      <Text style={styles.txt}>
        Sorry, Wallet 3 can't be initialized. To ensure the security of your encrypted assets, please manually backup your
        private keys.
      </Text>

      <Text style={styles.txt}>Please enable biometric authentication.</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: bottom }}>
        {keys.map((key, index) => {
          return (
            <View key={key} style={{ marginBottom: 24 }}>
              <Text style={{ color: warningColor, fontWeight: '500' }}>Wallet {index + 1}:</Text>
              <CopyableText
                copyText={key}
                txtStyle={{ color: warningColor, fontWeight: '600' }}
                txtLines={10}
                iconColor={warningColor}
                iconSize={11}
              />
            </View>
          );
        })}

        {keys.length > 0 && (
          <Text style={styles.txt}>After backing up your private keys, Please uninstall and reinstall Wallet 3.</Text>
        )}
      </ScrollView>
    </SafeViewContainer>
  );
};

const styles = StyleSheet.create({
  txt: {
    color: '#6186ff',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
});
