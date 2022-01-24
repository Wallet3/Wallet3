import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Entypo, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { borderColor, fontColor } from '../constants/styles';

import { BlurView } from 'expo-blur';
import BrowserScreen from './browser';
import DAppsScreen from './dapps';
import Drawer from './drawer';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';
import FashionWallet from './wallet/SocialWallet';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../viewmodels/Networks';
import PortfolioScreen from './portfolio';
import React from 'react';
import SettingScreen from './settings';
import WalletScreen from './wallet';
import { createDrawerNavigator } from '@react-navigation/drawer';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { useFonts } from 'expo-font';
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
  const { bottom } = useSafeAreaInsets();

  return (
    <Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Wallet: 'credit-card',
            Explore: 'compass',
            FashionWallet: 'credit-card',
          };

          return <Feather name={icons[route.name]} size={size} color={focused ? current.color : 'gray'} />;
        },
        tabBarActiveTintColor: current.color,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { marginBottom: bottom === 0 ? 7 : 3, marginTop: -3 },
        tabBarStyle: bottom === 0 ? { height: 57 } : undefined,
        tabBarLabelPosition: 'below-icon',
      })}
    >
      <Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: t('home-tab-wallet'),
          headerTitle: () => {
            return (
              <TouchableOpacity
                onPress={() => PubSub.publish('openNetworksMenu')}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}
              >
                <Text style={{ fontFamily: 'Questrial', fontSize: 20, color: current.color }}>Wallet 3</Text>
                <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 4 }} color={current.color} size={12} />
              </TouchableOpacity>
            );
          },
          headerLeft: () => (
            <TouchableOpacity
              style={{ padding: 16, paddingVertical: 0 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
            >
              <Feather name="menu" size={20} color={current.color} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('QRScan')}
              style={{
                zIndex: 5,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingStart: 8,
                paddingEnd: 2,
                marginEnd: 17,
              }}
            >
              <MaterialCommunityIcons name="scan-helper" size={16.5} style={{}} color={current.color} />
              <View
                style={{
                  position: 'absolute',
                  left: 2,
                  right: 4.5,
                  height: 1.5,
                  backgroundColor: current.color,
                  marginStart: 8,
                }}
              />
            </TouchableOpacity>
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
              <Feather name="menu" size={21} />
            </TouchableOpacity>
          ),
        }}
      /> */}

      <Screen name="Explore" component={BrowserScreen} options={{ tabBarLabel: 'Web3', headerShown: false }} />
    </Navigator>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const { Navigator, Screen } = DrawerRoot;
  const { t } = i18n;

  return (
    <Navigator
      initialRouteName="Home"
      drawerContent={Drawer}
      screenOptions={{
        sceneContainerStyle: { backgroundColor: '#fff' },
        headerTransparent: false,
        headerTintColor: fontColor,
        swipeEdgeWidth: ScreenWidth * 0.37,
        drawerType: 'slide',
        headerLeft: () => (
          <TouchableOpacity
            style={{ padding: 16, paddingVertical: 0 }}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
          >
            <Feather name="menu" size={20} />
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
        options={{ headerTransparent: true, headerTitleStyle: { display: 'none' } }}
      />
    </Navigator>
  );
});
