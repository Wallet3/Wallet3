import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { Coin } from '../../components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStack } from '../navigations';
import { UserToken } from '../../viewmodels/services/TokensMan';
import { observer } from 'mobx-react-lite';

const DraggableToken = observer(
  ({
    drag,
    isActive,
    item,
    onValueChange,
  }: {
    item: UserToken;
    drag: any;
    isActive: boolean;
    onValueChange: (on: boolean) => void;
  }) => (
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
      <Switch value={item.shown} onValueChange={(on) => onValueChange(on)} />
    </TouchableOpacity>
  )
);

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const { currentWallet } = App;
  const [data, setData] = useState(currentWallet?.currentAccount?.allTokens ?? []);

  const renderItem = (props: RenderItemParams<UserToken>) => {
    return <DraggableToken {...props} onValueChange={() => currentWallet?.currentAccount?.toggleToken(props.item)} />;
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <Text style={{ paddingHorizontal: 16, color: secondaryFontColor, paddingBottom: 8 }}>
        Move tokens with drag and drop
      </Text>
      <DraggableFlatList
        style={{ flex: 1 }}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.address}
        onDragEnd={({ data }) => {
          currentWallet?.currentAccount?.reorderTokens(data);
          setData(data);
        }}
      />
    </SafeAreaView>
  );
});
