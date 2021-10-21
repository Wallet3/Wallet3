import 'react-native-gesture-handler';

import { Button, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';

import Drawer from './components/drawer';
import HomeScreen from './screens/home';
import { Host } from 'react-native-portalize';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const { Group, Navigator, Screen } = createDrawerNavigator();

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: 'latest' | 'top' } | undefined;
};

function DetailsScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Details'>) {
  const { userId } = route.params || {};

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen {userId}</Text>
    </View>
  );
}

export default function App() {
  const { ref: modalizeRef } = useModalize();

  return (
    <NavigationContainer>
      <Host>
        <Navigator screenOptions={{ headerTransparent: false, headerTintColor: '#333' }} drawerContent={Drawer}>
          <Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Wallet 3',
            }}
          />
          <Screen name="Details" component={DetailsScreen} />
        </Navigator>
      </Host>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
