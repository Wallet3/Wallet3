import * as SecureStore from 'expo-secure-store';

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import CopyableText from '../../components/CopyableText';
import Database from '../../models/Database';
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
    <SafeViewContainer style={{ flex: 1, backgroundColor: 'yellow', paddingTop: top }}>
      <Text style={{ color: warningColor, fontWeight: '700', textTransform: 'uppercase' }}>
        Sorry, Wallet 3 can't be initialized. To ensure the security of your encrypted assets, please manually backup your
        private keys.
      </Text>

      <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ paddingBottom: bottom }}>
        {keys.map((key, index) => {
          return (
            <View key={key} style={{ marginBottom: 24 }}>
              <Text style={{ color: warningColor, fontWeight: '500' }}>Wallet {index + 1}:</Text>
              <CopyableText
                copyText={key}
                txtStyle={{ color: warningColor, fontWeight: '600' }}
                txtLines={10}
                iconColor={warningColor}
                iconSize={12}
              />
            </View>
          );
        })}

        <Text style={{ color: warningColor, fontWeight: '700', textTransform: 'uppercase' }}>
          After backing up your private keys, Please uninstall and reinstall Wallet 3.
        </Text>
      </ScrollView>
    </SafeViewContainer>
  );
};
