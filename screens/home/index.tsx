import { Button, StyleSheet, Text, View } from 'react-native';
import { Feather, FontAwesome5, SimpleLineIcons } from '@expo/vector-icons';
import React, { useMemo, useRef } from 'react';

import Actions from './components/actions';
import Assets from './components/assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Modalize } from 'react-native-modalize';
import Overview from './components/overview';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
      }}
    >
      <Overview style={{ height: 132, marginBottom: 12 }} />

      <Assets />

      <Actions style={{ marginBottom: 12 }} onSendPress={onOpen} />

      <Modalize ref={modalizeRef}>
        <Text>Hello</Text>
      </Modalize>

      <StatusBar style="dark" />
    </View>
  );
});
