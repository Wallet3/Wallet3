import 'react-native-gesture-handler';

import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';

import { Drawer } from './components';
import HomeScreen from './screens/home';
import { Host } from 'react-native-portalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DrawerRoot = createDrawerNavigator();
const StackRoot = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width;

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

const Root = () => {
  const { Navigator, Screen } = DrawerRoot;

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTransparent: false,
        headerTintColor: '#333',
        swipeEdgeWidth: screenWidth,
        drawerType: 'slide',
        headerRight: () => (
          <TouchableOpacity
            style={{
              zIndex: 5,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              marginEnd: 17,
            }}
            onPress={() => alert('a')}
          >
            <MaterialCommunityIcons name="scan-helper" size={18} style={{}} />
            <View style={{ position: 'absolute', left: 2, right: 2.5, height: 1.5, backgroundColor: '#000' }} />
          </TouchableOpacity>
        ),
      }}
      drawerContent={Drawer}
    >
      <Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Wallet 3',
        }}
      />
    </Navigator>
  );
};

export default function App() {
  const { Navigator, Screen } = StackRoot;

  return (
    <NavigationContainer>
      <Host>
        <Navigator>
          <Screen name="Root" component={Root} options={{ headerShown: false }} />
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
