import { Text, View } from 'react-native';

import Actions from './components/actions';
import Assets from './components/assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Modalize } from 'react-native-modalize';
import Overview from './components/overview';
import { Portal } from 'react-native-portalize';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { ref: modalizeRef, open, close } = useModalize();

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

      <Actions style={{ marginBottom: 12 }} onSendPress={open} />

      <Portal>
        <Modalize
          ref={modalizeRef}
          snapPoint={300}
          modalHeight={300}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <Text>Hello</Text>
        </Modalize>
      </Portal>

      <StatusBar style="dark" />
    </View>
  );
});
