import AppViewModel, { AppVM } from './viewmodels/App';
import AuthViewModel, { Authentication } from './viewmodels/Authentication';
import { ConnectDApp, NetworksMenu, Request, Send } from './modals';
import React, { useEffect, useState } from 'react';

import AddToken from './screens/tokens/AddToken';
import Backup from './screens/settings/Backup';
import ChangePasscode from './screens/settings/ChangePasscode';
import Currencies from './screens/settings/Currencies';
import { Dimensions } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { FullPasspad } from './modals/views/Passpad';
import { Host } from 'react-native-portalize';
import { IToken } from './common/Tokens';
import { Ionicons } from '@expo/vector-icons';
import LandScreen from './screens/land';
import Languages from './screens/settings/Languages';
import { Modalize } from 'react-native-modalize';
import { NavigationContainer } from '@react-navigation/native';
import Networks from './viewmodels/Networks';
import PubSub from 'pubsub-js';
import QRScan from './screens/misc/QRScan';
import Root from './screens/Root';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import VerifySecret from './screens/settings/VerifySecret';
import { autorun } from 'mobx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import { styles } from './constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

const StackRoot = createNativeStackNavigator();
const ScreenHeight = Dimensions.get('window').height;

AppViewModel.init();

const App = observer(({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { Navigator, Screen } = StackRoot;
  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();
  const { ref: requestRef, open: openRequestModal, close: closeRequestModal } = useModalize();
  const { ref: lockScreenRef, open: openLockScreen, close: closeLockScreen } = useModalize();
  const { ref: connectDappRef, open: openConnectDapp, close: closeConnectDapp } = useModalize();

  const [userSelectedToken, setUserSelectedToken] = useState<IToken>();
  const [connectUri, setConnectUri] = useState<string>();

  useEffect(() => {
    PubSub.subscribe('CodeScan', (_, { data }) => {
      setConnectUri(data);
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
        <ConnectDApp uri={connectUri} close={closeConnectDapp} />
      </Modalize>

      <FlashMessage position="top" hideStatusBar />
    </NavigationContainer>
  );
});

export default () => <App app={AppViewModel} appAuth={AuthViewModel} />;
