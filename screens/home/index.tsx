import { AmountPad, ContactsPad } from './modals/send';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Text, View } from 'react-native';

import Actions from './actions';
import Assets from './assets';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Modalize } from 'react-native-modalize';
import Overview from './overview';
import { Portal } from 'react-native-portalize';
import { StatusBar } from 'expo-status-bar';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

export default observer(({ navigation }: DrawerScreenProps<RootStackParamList, 'Home'>) => {
  const { ref: modalizeRef, open, close } = useModalize();
  const swiper = useRef<Swiper>(null);

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
          // modalHeight={460}
          adjustToContentHeight
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <Swiper
            ref={swiper}
            showsPagination={false}
            showsButtons={false}
            style={{ maxHeight: 420 }}
            scrollEnabled={false}
            loop={false}
            automaticallyAdjustContentInsets
            onIndexChanged={(i) => console.log(i)}
          >
            <ContactsPad onNext={() => swiper.current?.scrollTo(1, true)} />
            <AmountPad onBack={() => swiper.current?.scrollTo(-1)} />
          </Swiper>
        </Modalize>
      </Portal>

      <StatusBar style="dark" />
    </View>
  );
});
