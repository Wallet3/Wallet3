import { HomeScreenStack } from '../navigations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<HomeScreenStack, 'Tokens'>) => {
  return <View></View>;
});
