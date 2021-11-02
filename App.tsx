import 'react-native-gesture-handler';
import './configs/polyfill';

import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppViewModel, { AppVM } from './viewmodels/App';
import { Button, Dimensions, LogBox, StyleSheet, Text, View } from 'react-native';
import { Host, Portal } from 'react-native-portalize';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';

import AddToken from './screens/tokens/AddToken';
import Drawer from './screens/home/Drawer';
import HomeScreen from './screens/home';
import LandScreen from './screens/land';
import { Modalize } from 'react-native-modalize';
import NetworksMenu from './modals/Networks';
import PubSub from 'pubsub-js';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DrawerRoot = createDrawerNavigator();
const StackRoot = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width;

LogBox.ignoreLogs([
  'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component is no longer necessary. You can now directly use the ref instead. This method will be removed in a future release.',
]);

type RootStackParamList = {
  Home: undefined;
};

const Root = observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTransparent: false,
        headerTintColor: '#333',
        swipeEdgeWidth: screenWidth / 3,
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
});

const App = observer(({ app }: { app: AppVM }) => {
  const { Navigator, Screen } = StackRoot;
  const { ref: networksModal, open: openNetworksModal, close: closeNetworksModal } = useModalize();

  useEffect(() => {
    app.init();
    PubSub.subscribe('openNetworksModal', () => openNetworksModal());

    return () => AppViewModel.dispose();
  }, []);

  return (
    <NavigationContainer>
      <Host>
        {app.initialized ? (
          app.hasWallet ? (
            <Navigator
              initialRouteName="Root"
              screenOptions={({ navigation }) => {
                return {
                  headerTransparent: true,
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.pop()}>
                      <Ionicons name="arrow-back-outline" size={20} />
                    </TouchableOpacity>
                  ),
                };
              }}
            >
              <Screen name="Root" component={Root} options={{ headerShown: false }} />
              <Screen name="AddToken" component={AddToken} />
              <Screen
                name="Tokens"
                component={Tokens}
                options={({ navigation }) => {
                  return {
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('AddToken');
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={24} />
                      </TouchableOpacity>
                    ),
                  };
                }}
              />
            </Navigator>
          ) : (
            <Navigator>
              <Screen name="Land" component={LandScreen} options={{ headerShown: false }} />
            </Navigator>
          )
        ) : undefined}
      </Host>

      <Modalize
        ref={networksModal}
        adjustToContentHeight
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <NetworksMenu
          onNetworkPress={(_) => {
            closeNetworksModal();
          }}
        />
      </Modalize>
    </NavigationContainer>
  );
});

export default () => <App app={AppViewModel} />;
