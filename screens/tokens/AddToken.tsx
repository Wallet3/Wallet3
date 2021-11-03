import { Button, SafeViewContainer, Skeleton, TextBox } from '../../components';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderColor, fontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStack } from '../navigations';
import { UserToken } from '../../viewmodels/services/TokensMan';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const [addr, setAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<UserToken | undefined>();
  const { currentWallet } = App;

  useEffect(() => {
    if (!addr) return;
    setLoading(true);

    currentWallet?.currentAccount?.fetchToken(addr).then((t) => {
      setLoading(false);
      setToken(t);
    });
  }, [addr]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} scrollEnabled={false} contentContainerStyle={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SafeViewContainer style={{ flex: 1, paddingTop: 4 }}>
          <TextBox
            value={addr}
            onChangeText={(t) => {
              setAddr(t);
            }}
            title="Address:"
          />

          <View style={styles.item}>
            <Text style={styles.itemText}>Name:</Text>
            {loading ? (
              <Skeleton />
            ) : (
              <Text style={styles.itemText} numberOfLines={1}>
                {token?.name || '---'}
              </Text>
            )}
          </View>

          <View style={styles.item}>
            <Text style={styles.itemText}>Symbol:</Text>
            {loading ? (
              <Skeleton />
            ) : (
              <Text style={styles.itemText} numberOfLines={1}>
                {token?.symbol || '---'}
              </Text>
            )}
          </View>

          <View style={styles.item}>
            <Text style={styles.itemText}>Decimals:</Text>
            {loading ? (
              <Skeleton />
            ) : (
              <Text style={styles.itemText} numberOfLines={1}>
                {token?.decimals || '---'}
              </Text>
            )}
          </View>

          <View style={styles.item}>
            <Text style={styles.itemText}>Balance:</Text>
            {loading ? (
              <Skeleton />
            ) : (
              <Text style={styles.itemText} numberOfLines={1}>
                {token?.amount || '---'}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }} />

          <Button
            title="Save"
            disabled={!token}
            onPress={() => {
              currentWallet?.currentAccount?.addToken(token!);
              navigation.pop(2);
            }}
          />
        </SafeViewContainer>
      </SafeAreaView>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingTop: 10,
  },

  itemText: {
    fontSize: 17,
    color: fontColor,
  },
});
