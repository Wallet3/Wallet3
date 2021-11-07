import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import AppViewModel, { AppVM } from './viewmodels/App';
import { Dimensions, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';

import AddToken from './screens/tokens/AddToken';
import Authentication from './viewmodels/Authentication';
import Drawer from './screens/home/Drawer';
import FlashMessage from 'react-native-flash-message';
import HomeScreen from './screens/home';
import { Host } from 'react-native-portalize';
import LandScreen from './screens/land';
import LockScreen from './screens/security/LockScreen';
import { Modalize } from 'react-native-modalize';
import { NavigationContainer } from '@react-navigation/native';
import Networks from './viewmodels/Networks';
import NetworksMenu from './modals/Networks';
import PubSub from 'pubsub-js';
import Request from './modals/Request';
import Send from './modals/Send';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DrawerRoot = createDrawerNavigator();
const StackRoot = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width;

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
  const { ref: sendModalizeRef, open: openSendModal, close: closeSendModal } = useModalize();
  const { ref: requestModalizeRef, open: openRequestModal, close: closeRequestModal } = useModalize();

  useEffect(() => {
    app.init();
    PubSub.subscribe('openNetworksModal', () => openNetworksModal());
    PubSub.subscribe('openSendModal', () => openSendModal());
    PubSub.subscribe('openRequestModal', () => openRequestModal());
    PubSub.subscribe('closeSendModal', () => closeSendModal());

    return () => AppViewModel.dispose();
  }, []);

  return (
    <NavigationContainer>
      <Host>
        {app.initialized ? (
          app.hasWallet ? (
            Authentication.appAuthorized ? (
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
                <Screen name="LockScreen" component={LockScreen} options={{ headerShown: false }} />
              </Navigator>
            )
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
          onNetworkPress={(network) => {
            closeNetworksModal();
            Networks.switch(network);
          }}
        />
      </Modalize>
      <Modalize
        ref={sendModalizeRef}
        adjustToContentHeight
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <Send />
      </Modalize>
      <Modalize
        ref={requestModalizeRef}
        adjustToContentHeight
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <Request />
      </Modalize>

      <FlashMessage position="top" hideStatusBar />
    </NavigationContainer>
  );
});

export default () => <App app={AppViewModel} />;
