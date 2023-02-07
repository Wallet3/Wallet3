// @ts-nocheck

import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import App from '../viewmodels/core/App';
import BrowserScreen from './browser/MultiTabIndex';
import ContactsScreen from './contacts';
import DAppsScreen from './dapps';
import Drawer from './drawer';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';
import ExchangeScreen from './exchange';
import MessageKeys from '../common/MessageKeys';
import NFTList from './nfts/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../viewmodels/core/Networks';
import { ReactiveScreen } from '../utils/device';
import SettingScreen from './settings';
import SinglePageBrowserScreen from './browser/Browser';
import Theme from '../viewmodels/settings/Theme';
import TxHub from '../viewmodels/hubs/TxHub';
import WalletScreen from './wallet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerRoot = createDrawerNavigator();
const TabNavigation = createBottomTabNavigator<any>();

type RootStackParamList = {
  Home: undefined;
  QRScan: undefined;
  Portfolio: undefined;
};

const RootTab = observer(() => {
  const { t } = i18n;
  const { current } = Networks;
  const { Navigator, Screen } = TabNavigation;
  const { bottom, top } = useSafeAreaInsets();
  const navigation = useNavigation() as DrawerNavigationHelpers;
  const { currentAccount } = App;
  let { foregroundColor, backgroundColor, systemBorderColor, borderColor, isLightMode } = Theme;

  foregroundColor = isLightMode ? foregroundColor : current.color;
  const baseTarBarStyle = { backgroundColor, borderTopColor: systemBorderColor };
  const tabBarStyle = bottom === 0 ? { ...baseTarBarStyle, height: 57 } : baseTarBarStyle;

  useEffect(() => {
    PubSub.subscribe(MessageKeys.openBrowser, () => navigation.navigate('Browser'));

    return () => {
      PubSub.unsubscribe(MessageKeys.openBrowser);
    };
  }, []);

  return (
    <Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: current.color,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { marginBottom: bottom === 0 ? 7 : 3, marginTop: -3 },
        tabBarStyle,
        headerStyle: { backgroundColor },
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, size }) => {
          const icons = {
            Wallet: 'credit-card',
            Browser: 'compass',
            NFTs: 'star',
            Exchange: 'refresh-ccw',
          };

          return <Feather name={icons[route.name]} size={22} color={focused ? current.color : 'gray'} />;
        },
      })}
    >
      {currentAccount?.nfts.nfts.length ?? 0 > 0 ? (
        <Screen name="NFTs" component={NFTList} options={{ tabBarLabel: t('home-tab-arts'), headerShown: false }} />
      ) : undefined}

      {Platform.OS !== 'ios' || TxHub.txs.length > 3 ? (
        <Screen
          name="Exchange"
          component={ExchangeScreen}
          options={{
            tabBarLabel: t('home-tab-exchange'),
            headerShown: false,
          }}
        />
      ) : undefined}

      <Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: t('home-tab-wallet'),
          header: () => (
            <View
              style={{
                paddingTop: top + 4,
                paddingBottom: 7,
                backgroundColor,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: systemBorderColor,
                borderBottomWidth: 0.33,
              }}
            >
              <TouchableOpacity
                style={{ padding: 16, paddingVertical: 4 }}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
              >
                <Feather name="menu" size={20} color={foregroundColor} style={{}} />
              </TouchableOpacity>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => PubSub.publish(MessageKeys.openAccountsMenu)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}
                >
                  <Text style={{ fontFamily: 'Questrial', fontSize: 21, color: foregroundColor }}>Wallet 3</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => PubSub.publish(MessageKeys.openGlobalQRScanner)}
                style={{
                  zIndex: 5,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  paddingStart: 13,
                  paddingVertical: 5,
                  paddingEnd: 15,
                }}
              >
                <Ionicons name="scan-outline" size={21} color={foregroundColor} />
                <View
                  style={{
                    position: 'absolute',
                    left: 2,
                    right: 4.5,
                    height: 1.2,
                    marginEnd: 15,
                    marginStart: 14,
                    backgroundColor: foregroundColor,
                    borderRadius: 2,
                  }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Screen
        name="Browser"
        component={Platform.OS === 'android' ? SinglePageBrowserScreen : BrowserScreen}
        options={{
          tabBarLabel: 'Web3',
          headerShown: false,
          tabBarStyle,
        }}
      />
    </Navigator>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;
  const { t } = i18n;
  const { backgroundColor, foregroundColor, borderColor } = Theme;
  const [swipeEnabled, setSwipeEnabled] = useState(true);

  useEffect(() => {
    PubSub.subscribe(MessageKeys.drawerSwipeEnabled, (_, data) => setSwipeEnabled(data));

    return () => {
      PubSub.unsubscribe(MessageKeys.drawerSwipeEnabled);
    };
  }, []);

  return (
    <Navigator
      initialRouteName="Home"
      drawerContent={Drawer}
      screenOptions={{
        sceneContainerStyle: { backgroundColor: backgroundColor },
        headerTransparent: false,
        headerTintColor: foregroundColor,
        swipeEdgeWidth: ReactiveScreen.width * 0.1,
        swipeEnabled,
        drawerType: 'slide',
        headerBackgroundContainerStyle: { borderBottomColor: borderColor },
        headerStyle: { backgroundColor, borderBottomColor: borderColor },
        headerLeft: () => (
          <TouchableOpacity
            style={{ padding: 16, paddingVertical: 0 }}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
          >
            <Feather name="menu" size={20} color={foregroundColor} style={{}} />
          </TouchableOpacity>
        ),
      }}
    >
      <Screen name="Home" component={RootTab} options={{ headerShown: false }} />
      <Screen name="Contacts" component={ContactsScreen} options={{ title: t('home-drawer-contacts') }} />
      <Screen name="Settings" component={SettingScreen} options={{ title: t('home-drawer-settings') }} />
      <Screen
        name="ConnectedDapps"
        component={DAppsScreen}
        options={{ title: t('connectedapps-title'), headerShown: false }}
      />
    </Navigator>
  );
});
