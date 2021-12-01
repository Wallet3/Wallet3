import { Button, SafeViewContainer, Skeleton, TextBox } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderColor, fontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStack } from '../navigations';
import { UserToken } from '../../viewmodels/services/TokensMan';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const { t } = i18n;
  const [addr, setAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<UserToken | undefined>();
  const { currentWallet } = App;

  useEffect(() => {
    if (!addr) return;
    setLoading(true);

    currentWallet?.currentAccount?.tokens.fetchToken(addr).then((t) => {
      setLoading(false);
      setToken(t);
    });
  }, [addr]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} scrollEnabled={false} contentContainerStyle={{ flex: 1 }}>
      <SafeViewContainer style={{ flex: 1 }} paddingHeader>
        <TextBox
          title={`${t('home-add-token-address')}:`}
          placeholder={t('home-add-token-placeholder')}
          value={addr}
          onChangeText={(t) => setAddr(t)}
        />

        <View style={styles.item}>
          <Text style={styles.itemText}>{t('home-add-token-name')}:</Text>
          {loading ? (
            <Skeleton style={{ height: 17 }} />
          ) : (
            <Text style={styles.itemText} numberOfLines={1}>
              {token?.name || '---'}
            </Text>
          )}
        </View>

        <View style={styles.item}>
          <Text style={styles.itemText}>{t('home-add-token-symbol')}:</Text>
          {loading ? (
            <Skeleton style={{ height: 17 }} />
          ) : (
            <Text style={styles.itemText} numberOfLines={1}>
              {token?.symbol || '---'}
            </Text>
          )}
        </View>

        <View style={styles.item}>
          <Text style={styles.itemText}>{t('home-add-token-decimals')}:</Text>
          {loading ? (
            <Skeleton style={{ height: 17 }} />
          ) : (
            <Text style={styles.itemText} numberOfLines={1}>
              {token?.decimals || '---'}
            </Text>
          )}
        </View>

        <View style={styles.item}>
          <Text style={styles.itemText}>{t('home-add-token-balance')}:</Text>
          {loading ? (
            <Skeleton style={{ height: 17 }} />
          ) : (
            <Text style={styles.itemText} numberOfLines={1}>
              {token?.amount || '---'}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title={t('button-save')}
          disabled={!token}
          onPress={() => {
            currentWallet?.currentAccount?.tokens.addToken(token!);
            navigation.popToTop();
          }}
        />
      </SafeViewContainer>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingTop: 10,
  },

  itemText: {
    fontSize: 16,
    color: fontColor,
  },
});
