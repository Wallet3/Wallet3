import { Button, SafeViewContainer, TextBox } from '../../components';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStack } from '../navigations';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const [addr, setAddr] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ flex: 1, paddingTop: 4 }}>
        <TextBox
          value={addr}
          onChangeText={(t) => {
            setAddr(t);
          }}
          title="Address:"
        />

        <View style={styles.item}></View>

        <View style={{ flex: 1 }} />
        <Button title="Save" />
      </SafeViewContainer>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
