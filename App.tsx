import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import AppViewModel, { AppVM } from './viewmodels/App';
import AuthViewModel, { Authentication } from './viewmodels/Authentication';
import { Dimensions, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NetworksMenu, Request, Send } from './modals';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { autorun, reaction } from 'mobx';

import AddToken from './screens/tokens/AddToken';
import Backup from './screens/settings/Backup';
import ChangePasscode from './screens/settings/ChangePasscode';
import Currencies from './screens/settings/Currencies';
import Drawer from './screens/home/Drawer';
import FlashMessage from 'react-native-flash-message';
import { FullPasspad } from './modals/views/Passpad';
import HomeScreen from './screens/home';
import { Host } from 'react-native-portalize';
import LandScreen from './screens/land';
import Languages from './screens/settings/Languages';
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

AppViewModel.init();

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

const App = observer(({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { Navigator, Screen } = StackRoot;
  const { ref: networksModal, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: sendModalizeRef, open: openSendModal, close: closeSendModal } = useModalize();
  const { ref: requestModalizeRef, open: openRequestModal, close: closeRequestModal } = useModalize();
  const { ref: lockscreenModalizeRef, open: openLockScreen, close: closeLockScreen } = useModalize();

  useEffect(() => {
    PubSub.subscribe('openNetworksModal', () => openNetworksModal());
    PubSub.subscribe('openSendModal', () => openSendModal());
    PubSub.subscribe('openRequestModal', () => openRequestModal());
    PubSub.subscribe('closeSendModal', () => closeSendModal());

    const dispose = autorun(async () => {
      if (!app.hasWallet || appAuth.appAuthorized) return;

      openLockScreen();

      if (!appAuth.biometricsEnabled || !appAuth.biometricsSupported) return;

      const success = await appAuth.authorize();
      if (success) closeLockScreen();
    });

    return () => {
      AppViewModel.dispose();
      dispose();
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
              <Screen name="Languages" component={Languages} />
              <Screen name="Currencies" component={Currencies} />
              <Screen name="ChangePasscode" component={ChangePasscode} options={{ title: 'Change Passcode' }} />
              <Screen name="Backup" component={Backup} options={{ title: 'Backup' }} />
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
        <FullPasspad
          themeColor={Networks.current.color}
          height={ScreenHeight}
          onCodeEntered={async (code) => {
            const success = await appAuth.authorize(code);
            if (success) closeLockScreen();
            return success;
          }}
        />
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

export default () => <App app={AppViewModel} appAuth={AuthViewModel} />;
