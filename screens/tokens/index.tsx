import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import App from '../../viewmodels/App';
import { Coin } from '../../components';
import { IToken } from '../../common/Tokens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStack } from '../navigations';
import { fontColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const { currentWallet } = App;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<IToken>) => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
      >
        <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} />
        <Text style={{ fontSize: 18, color: fontColor }}>{item.symbol}</Text>
        <View style={{ flex: 1 }} />
        <Switch />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <DraggableFlatList
        style={{ flex: 1 }}
        data={currentWallet?.currentAccount?.allTokens || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.address}
        onDragEnd={({ data }) => {}}
      />
    </SafeAreaView>
  );
});
