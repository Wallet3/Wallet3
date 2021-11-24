import AppViewModel, { AppVM } from './viewmodels/App';
import AuthViewModel, { Authentication } from './viewmodels/Authentication';

import { About } from './screens/settings/About';
import AddToken from './screens/tokens/AddToken';
import Backup from './screens/settings/Backup';
import ChangePasscode from './screens/settings/ChangePasscode';
import Currencies from './screens/settings/Currencies';
import FlashMessage from 'react-native-flash-message';
import { Host } from 'react-native-portalize';
import { Ionicons } from '@expo/vector-icons';
import LandScreen from './screens/land';
import Languages from './screens/settings/Languages';
import Modals from './screens/Modalize';
import { NavigationContainer } from '@react-navigation/native';
import QRScan from './screens/misc/QRScan';
import React from 'react';
import Root from './screens/Root';
import Tokens from './screens/tokens/SortTokens';
import { TouchableOpacity } from 'react-native-gesture-handler';
import VerifySecret from './screens/settings/VerifySecret';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import i18n from './i18n';
import { observer } from 'mobx-react-lite';
import { title } from 'process';

AppViewModel.init();

const StackRoot = createNativeStackNavigator();

const App = observer(({ app, appAuth }: { app: AppVM; appAuth: Authentication }) => {
  const { Navigator, Screen } = StackRoot;
  const { t } = i18n;

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
                    <TouchableOpacity onPress={() => navigation.pop()} style={{ margin: -12, padding: 12, zIndex: 99 }}>
                      <Ionicons name="arrow-back-outline" size={20} />
                    </TouchableOpacity>
                  ),
                };
              }}
            >
              <Screen name="Root" component={Root} options={{ headerShown: false }} />
              <Screen name="Languages" component={Languages} options={{ title: t('settings-languages') }} />
              <Screen name="Currencies" component={Currencies} options={{ title: t('settings-currencies') }} />
              <Screen name="ChangePasscode" component={ChangePasscode} options={{ title: t('settings-security-passcode') }} />
              <Screen name="Backup" component={Backup} options={{ title: t('settings-security-backup') }} />
              <Screen name="VerifySecret" component={VerifySecret} options={{ title: t('settings-security-backup-verify') }} />
              <Screen name="AddToken" component={AddToken} options={{ title: t('home-addToken-Title') }} />
              <Screen name="About" component={About} />
              <Screen
                name="QRScan"
                component={QRScan}
                options={({ navigation }) => {
                  return {
                    animation: 'slide_from_bottom',
                    headerTintColor: '#ffffff',
                    title: t('home-qrscan-Title'),
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
                    title: t('home-tokens-Title'),
                    headerRight: () => (
                      <TouchableOpacity onPress={() => navigation.navigate('AddToken')}>
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

      {Modals({ app, appAuth })}

      <FlashMessage position="top" hideStatusBar />
    </NavigationContainer>
  );
});

export default () => <App app={AppViewModel} appAuth={AuthViewModel} />;
