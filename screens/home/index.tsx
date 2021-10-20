import { Button, StyleSheet, Text, View } from 'react-native';
import { Feather, FontAwesome5, SimpleLineIcons } from '@expo/vector-icons';

import Actions from './components/actions';
import Assets from './components/assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import Overview from './components/overview';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
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

      <Actions style={{ marginBottom: 12 }} />

      <StatusBar style="dark" />
    </View>
  );
});
