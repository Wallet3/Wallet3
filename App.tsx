import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import AppViewModel, { AppVM } from './viewmodels/App';
import { Dimensions, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NetworksMenu, Request, Send } from './modals';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { autorun, reaction } from 'mobx';

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
import { Passpad } from './modals/views';
import PubSub from 'pubsub-js';
import { SafeViewContainer } from './components';
import SettingScreen from './screens/settings';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { fontColor } from './constants/styles';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DrawerRoot = createDrawerNavigator();
const StackRoot = createNativeStackNavigator();
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

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
        headerTintColor: fontColor,
        swipeEdgeWidth: ScreenWidth / 2,
        drawerType: 'slide',
      }}
      drawerContent={Drawer}
    >
      <Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Wallet 3',
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
      />

      <Screen name="Settings" component={SettingScreen} options={{ title: 'Settings' }} />
    </Navigator>
  );
});

const App = observer(({ app }: { app: AppVM }) => {
  const { Navigator, Screen } = StackRoot;
  const { ref: networksModal, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: sendModalizeRef, open: openSendModal, close: closeSendModal } = useModalize();
  const { ref: requestModalizeRef, open: openRequestModal, close: closeRequestModal } = useModalize();
  const { ref: lockscreenModalizeRef, open: openLockScreen, close: closeLockScreen } = useModalize();

  useEffect(() => {
    app.init();
    PubSub.subscribe('openNetworksModal', () => openNetworksModal());
    PubSub.subscribe('openSendModal', () => openSendModal());
    PubSub.subscribe('openRequestModal', () => openRequestModal());
    PubSub.subscribe('closeSendModal', () => closeSendModal());

    const dipose = autorun(() => {
      if (app.hasWallet && !Authentication.appAuthorized) {
        openLockScreen();
      }
    });

    return () => {
      AppViewModel.dispose();
      dipose();
    };
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
        ref={lockscreenModalizeRef}
        modalHeight={ScreenHeight}
        closeOnOverlayTap={false}
        disableScrollIfPossible
        panGestureEnabled={false}
        panGestureComponentEnabled={false}
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, height: ScreenHeight }}>
            <Passpad
              onCodeEntered={async (code) => {
                const success = await Authentication.authorize(code);
                if (success) closeLockScreen();
                return success;
              }}
              themeColor={Networks.current.color}
              disableCancel
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modalize>

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
