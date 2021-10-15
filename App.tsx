import "react-native-gesture-handler";

import { Button, StyleSheet, Text, View } from "react-native";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { NavigationContainer, RouteProp } from "@react-navigation/native";

import Drawer from "./components/drawer";
import HomeScreen from "./screens/home";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { createDrawerNavigator } from "@react-navigation/drawer";

const { Group, Navigator, Screen } = createDrawerNavigator();

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: "latest" | "top" } | undefined;
};

function DetailsScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Details">) {
  const { userId } = route.params || {};

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Details Screen {userId}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Navigator
        screenOptions={{ headerTransparent: true }}
        drawerContent={Drawer}
      >
        <Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Wallet 3" }}
        />
        <Screen name="Details" component={DetailsScreen} />
      </Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
