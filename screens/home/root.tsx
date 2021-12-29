import React from 'react';
import WalletScreen from './index';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const { Navigator, Screen } = Tab;

export default () => {
  return (
    <Navigator initialRouteName="Wallet" screenOptions={{ headerShown: false }}>
      <Screen name="Wallet" component={WalletScreen} />
    </Navigator>
  );
};
