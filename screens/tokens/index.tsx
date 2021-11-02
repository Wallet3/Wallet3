import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RootStack } from '../navigations';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  return <View></View>;
});
