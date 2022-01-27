import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import BrowserScreen from './browser';
import DAppsScreen from './dapps';
import Drawer from './drawer';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../viewmodels/Networks';
import PortfolioScreen from './portfolio';
import React from 'react';
import SettingScreen from './settings';
import Theme from '../viewmodels/settings/Theme';
import WalletScreen from './wallet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerRoot = createDrawerNavigator();
const TabNavigation = createBottomTabNavigator();
const ScreenWidth = Dimensions.get('window').width;

type RootStackParamList = {
  Home: undefined;
  QRScan: undefined;
  Portfolio: undefined;
};

const RootTab = observer(() => {
  const { t } = i18n;
  const { current } = Networks;
  const navigation = useNavigation() as DrawerNavigationHelpers;
  const { Navigator, Screen } = TabNavigation;
  const { bottom, top } = useSafeAreaInsets();
  let { foregroundColor, backgroundColor, systemBorderColor, borderColor, isLightMode } = Theme;

  foregroundColor = isLightMode ? foregroundColor : current.color;

  return (
    <Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: current.color,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { marginBottom: bottom === 0 ? 7 : 3, marginTop: -3 },
        tabBarStyle: {
          backgroundColor,
          height: bottom === 0 ? 57 : 79,
          borderTopColor: systemBorderColor,
        },
        headerStyle: { backgroundColor },
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, size }) => {
          const icons = {
            Wallet: 'credit-card',
            Explore: 'compass',
            FashionWallet: 'credit-card',
          };

          return <Feather name={icons[route.name]} size={size} color={focused ? current.color : 'gray'} />;
        },
      })}
    >
      <Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: t('home-tab-wallet'),
          header: () => (
            <View
              style={{
                paddingTop: top + 4,
                paddingBottom: 6,
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
                <Ionicons name="menu-outline" size={23} color={foregroundColor} />
              </TouchableOpacity>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => PubSub.publish('openAccountsMenu')}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}
                >
                  <Text style={{ fontFamily: 'Questrial', fontSize: 20, color: foregroundColor }}>Wallet 3</Text>
                  {/* <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 4 }} size={12} /> */}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate('QRScan')}
                style={{
                  zIndex: 5,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  paddingStart: 19,
                  paddingVertical: 5,
                  paddingEnd: 19,
                }}
              >
                <MaterialCommunityIcons name="scan-helper" size={16.5} color={foregroundColor} />
                <View
                  style={{
                    position: 'absolute',
                    left: 2,
                    right: 4.5,
                    height: 1.5,
                    marginEnd: 17,
                    marginStart: 19,
                    backgroundColor: foregroundColor,
                  }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* <Screen
        name="FashionWallet"
        component={FashionWallet}
        options={{
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 16, paddingVertical: 0 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
            >
              <Ionicons name="menu-outline" size={23} />
            </TouchableOpacity>
          ),
        }}
      /> */}

      <Screen
        name="Explore"
        component={BrowserScreen}
        options={{
          tabBarLabel: 'Web3',
          headerShown: false,
          tabBarStyle: { backgroundColor, borderTopColor: systemBorderColor },
        }}
      />
    </Navigator>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;
  const { t } = i18n;
  const { backgroundColor, foregroundColor, borderColor } = Theme;

  return (
    <Navigator
      initialRouteName="Home"
      drawerContent={Drawer}
      screenOptions={{
        sceneContainerStyle: { backgroundColor: backgroundColor },
        headerTransparent: false,
        headerTintColor: foregroundColor,
        swipeEdgeWidth: ScreenWidth * 0.25,
        drawerType: 'slide',
        headerBackgroundContainerStyle: { borderBottomColor: borderColor },
        headerStyle: { backgroundColor, borderBottomColor: borderColor },
        headerLeft: () => (
          <TouchableOpacity
            style={{ padding: 16, paddingVertical: 0 }}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
          >
            <Ionicons name="menu-outline" size={23} color={foregroundColor} />
          </TouchableOpacity>
        ),
      }}
    >
      <Screen name="Home" component={RootTab} options={{ headerShown: false }} />

      <Screen name="Settings" component={SettingScreen} options={{ title: t('home-drawer-settings') }} />
      <Screen name="DApps" component={DAppsScreen} options={{ title: t('connectedapps-title') }} />

      <Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ headerTransparent: true, headerShown: false, headerTitleStyle: { display: 'none' } }}
      />
    </Navigator>
  );
});
