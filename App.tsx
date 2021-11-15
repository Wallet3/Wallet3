import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import * as Linking from 'expo-linking';

import AppViewModel, { AppVM } from './viewmodels/App';
import AuthViewModel, { Authentication } from './viewmodels/Authentication';
import { ConnectDApp, NetworksMenu, Request, Send } from './modals';
import { Dimensions, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { autorun, reaction } from 'mobx';
import { fontColor, styles } from './constants/styles';

import AddToken from './screens/tokens/AddToken';
import Backup from './screens/settings/Backup';
import ChangePasscode from './screens/settings/ChangePasscode';
import Currencies from './screens/settings/Currencies';
import Drawer from './screens/home/Drawer';
import FlashMessage from 'react-native-flash-message';
import { FullPasspad } from './modals/views/Passpad';
import HomeScreen from './screens/home';
import { Host } from 'react-native-portalize';
import { IToken } from './common/Tokens';
import LandScreen from './screens/land';
import Languages from './screens/settings/Languages';
import { Modalize } from 'react-native-modalize';
import { NavigationContainer } from '@react-navigation/native';
import Networks from './viewmodels/Networks';
import { Passpad } from './modals/views';
import PubSub from 'pubsub-js';
import QRScan from './screens/misc/QRScan';
import { SafeViewContainer } from './components';
import SettingScreen from './screens/settings';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import VerifySecret from './screens/settings/VerifySecret';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const DrawerRoot = createDrawerNavigator();
const StackRoot = createNativeStackNavigator();
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

AppViewModel.init();

type RootStackParamList = {
  Home: undefined;
  QRScan: undefined;
};

const Root = observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTransparent: false,
        headerTintColor: fontColor,
        swipeEdgeWidth: ScreenWidth * 0.37,
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
              onPress={() => navigation.navigate('QRScan')}
              style={{
                zIndex: 5,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingStart: 8,
                marginEnd: 17,
              }}
            >
              <MaterialCommunityIcons name="scan-helper" size={18} style={{}} />
              <View
                style={{ position: 'absolute', left: 2, right: 2.5, height: 1.5, backgroundColor: '#000', marginStart: 8 }}
              />
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
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();
  const { ref: requestRef, open: openRequestModal, close: closeRequestModal } = useModalize();
  const { ref: lockScreenRef, open: openLockScreen, close: closeLockScreen } = useModalize();
  const { ref: connectDappRef, open: openConnectDapp, close: closeConnectDapp } = useModalize();

  const [userSelectedToken, setUserSelectedToken] = useState<IToken>();

  useEffect(() => {
    PubSub.subscribe('CodeScan', (_, { data }) => {
      openConnectDapp();
    });

    PubSub.subscribe('openNetworksModal', () => openNetworksModal());
    PubSub.subscribe('openSendModal', (message, data) => {
      const { token } = data || {};
      setUserSelectedToken(token);
      setTimeout(() => openSendModal(), 0);
    });

    PubSub.subscribe('closeSendModal', () => closeSendModal());
    PubSub.subscribe('openRequestModal', () => openRequestModal());

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
              <Screen name="VerifySecret" component={VerifySecret} options={{ title: 'Verify' }} />
              <Screen name="AddToken" component={AddToken} />
              <Screen
                name="QRScan"
                component={QRScan}
                options={({ navigation }) => {
                  return {
                    animation: 'slide_from_bottom',
                    headerTintColor: '#ffffff',
                    headerLeft: () => (
                      <TouchableOpacity onPress={() => navigation.pop()}>
                        <Ionicons name="arrow-back-outline" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    ),
                  };
                }}
              />
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
        ref={lockScreenRef}
        modalHeight={ScreenHeight}
        closeOnOverlayTap={false}
        disableScrollIfPossible
        panGestureEnabled={false}
        panGestureComponentEnabled={false}
        modalStyle={{ borderTopStartRadius: 0, borderTopEndRadius: 0 }}
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
        ref={networksRef}
        adjustToContentHeight
        useNativeDriver={false}
        disableScrollIfPossible
        modalStyle={styles.modalStyle}
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
        ref={sendRef}
        adjustToContentHeight
        disableScrollIfPossible
        useNativeDriver={false}
        modalStyle={styles.modalStyle}
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <Send initToken={userSelectedToken} />
      </Modalize>

      <Modalize
        ref={requestRef}
        adjustToContentHeight
        useNativeDriver={false}
        disableScrollIfPossible
        modalStyle={styles.modalStyle}
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <Request />
      </Modalize>

      <Modalize
        ref={connectDappRef}
        adjustToContentHeight
        panGestureEnabled={false}
        panGestureComponentEnabled={false}
        tapGestureEnabled={false}
        closeOnOverlayTap={false}
        useNativeDriver={false}
        withHandle={false}
        disableScrollIfPossible
        modalStyle={styles.modalStyle}
        scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
      >
        <ConnectDApp />
      </Modalize>

      <FlashMessage position="top" hideStatusBar />
    </NavigationContainer>
  );
});

export default () => <App app={AppViewModel} appAuth={AuthViewModel} />;

console.log(
  Linking.parse(
    'wc:ede2260a-d193-4461-aac3-927b4236f577@1?bridge=https%3A%2F%2Fv.bridge.walletconnect.org&key=8bf7950d073cbf5370f72c7502d9830b15a0fd3baef314fdb8e8bbb5f6065437'
  )
);
