import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import BrowserScreen from './browser';
import DAppsScreen from './dapps';
import Drawer from './drawer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../viewmodels/Networks';
import PortfolioScreen from './portfolio';
import React from 'react';
import SettingScreen from './settings';
import WalletScreen from './wallet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { fontColor } from '../constants/styles';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';

const DrawerRoot = createDrawerNavigator();
const ScreenWidth = Dimensions.get('window').width;

type RootStackParamList = {
  Home: undefined;
  QRScan: undefined;
  Portfolio: undefined;
};

const Tab = createBottomTabNavigator();
const { Navigator, Screen } = Tab;

const RootTab = observer(() => {
  const { current } = Networks;
  const { t } = i18n;

  return (
    <Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Wallet: 'credit-card',
            Explore: 'compass',
          };

          return <Feather name={icons[route.name]} size={size} color={focused ? current.color : 'gray'} />;
        },
        tabBarActiveTintColor: current.color,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Screen name="Wallet" component={WalletScreen} options={{ tabBarLabel: 'Wallet' }} />
      <Screen name="Explore" component={BrowserScreen} options={{ tabBarLabel: 'Explore' }} />
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
        headerTransparent: false,
        headerTintColor: fontColor,
        swipeEdgeWidth: ScreenWidth * 0.37,
        drawerType: 'slide',
      }}
    >
      <Screen
        name="Home"
        component={RootTab}
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
                paddingEnd: 2,
                marginEnd: 17,
              }}
            >
              <MaterialCommunityIcons name="scan-helper" size={18} style={{}} />
              <View
                style={{ position: 'absolute', left: 2, right: 4.5, height: 1.5, backgroundColor: '#000', marginStart: 8 }}
              />
            </TouchableOpacity>
          ),
        }}
      />

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
