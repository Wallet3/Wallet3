import Actions from './actions';
import Assets from './assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Modalize } from 'react-native-modalize';
import Overview from './overview';
import { Portal } from 'react-native-portalize';
import React from 'react';
import Send from '../../modals/send';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { ref: sendModalizeRef, open, close } = useModalize();

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
          ref={sendModalizeRef}
          adjustToContentHeight
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <Send />
        </Modalize>
      </Portal>

      <StatusBar style="dark" />
    </View>
  );
});
