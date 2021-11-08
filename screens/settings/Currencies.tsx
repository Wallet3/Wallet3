import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 17 }}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={['USD', 'ETH']}
          renderItem={renderItem}
          keyExtractor={(i) => i}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: borderColor }} />}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
